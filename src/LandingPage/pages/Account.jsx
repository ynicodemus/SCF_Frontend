import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Account() {
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Control states
  const [step, setStep] = useState(1); // 1=login, 2=forgot password, 3=reset password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Image slideshow
  const images = [
    "/images/anniversarry.jpg",
    "/images/assembly.jpg",
    "/images/celebration.jpg",
  ];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (step === 1) {
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    }
    if (step === 3) {
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [step]);

  // === LOGIN ===
  const handleLoginClick = async () => {
    setMessage('');
    if (!email || !password) {
      setMessage('Ilagay ang email at password.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('https://scf-backend-92qq.onrender.com/SeniorConnect/login/', {
        email: email.trim(),
        password: password.trim(),
      });

      if (res.data.message === 'Login successful!') {
        // prefer server-provided email if available
        const returnedEmail = (res.data.email || res.data.user?.email || email || '').toString().trim().toLowerCase();

        // clear any stale membership flags from previous sessions
        localStorage.removeItem('membershipSubmitted');
        localStorage.removeItem('approvedIdNumber');

        localStorage.setItem('citizenToken', res.data.token);
        localStorage.setItem('isMember', String(res.data.is_member));
        localStorage.setItem('id_number', res.data.id_number || '');
        // store both keys so other components remain compatible
        localStorage.setItem('userEmail', returnedEmail);
        localStorage.setItem('email', returnedEmail);

        if (res.data.is_member) {
          navigate('/citizen/MyProfile');
        } else {
          navigate('/citizen/RequestMember');
        }
      } else {
        setMessage(res.data.message || 'Paki-check ang inyong email at password, at subukan muli.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      if (err.response?.data?.error === 'Invalid email or password') {
        setMessage('Paki-check ang inyong email at password, at subukan muli.');
        setTimeout(() => setMessage(''), 3000);
      } else if (err.response?.data?.error === 'Account not found') {
        setMessage('Walang nakitang account gamit ang email na ito. Mangyaring gumawa muna ng account.');
        setTimeout(() => setMessage(''), 3000);
      } else if (err.response?.data?.error === 'This account has been archived or deleted. Please contact your federation admin.') {
        setMessage('Hindi na aktibo ang account na ito. Makipag-ugnay sa inyong federation admin.');
        setTimeout(() => setMessage(''), 3000);
      } else if (err.response?.data?.message) {
        setMessage(`${err.response.data.message}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('May naging problema. Subukan muli mamaya.');
        setTimeout(() => setMessage(''), 3000);
      }
    }

    setLoading(false);
  };

  // === SEND OTP ===
  const handleSendOtp = async () => {
    setMessage('');

    if (!email) {
      setMessage('Ilagay ang iyong email upang ma-reset ang iyong password.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://scf-backend-92qq.onrender.com/SeniorConnect/sc_send_reset_otp/', { email });
      setMessage('Naipadala na ang OTP sa iyong email. Pakitingnan ang iyong Gmail.');
      setTimeout(() => setMessage(''), 3000);
      setStep(3);
    } catch (err) {
      if (err.response?.data?.error === 'No account found with this email.') {
        setMessage(
          <>
            Wala ka pang nakarehistrong account.{' '}
            <span
              onClick={() => navigate('/CCreateAcc')}
              style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Gumawa ng account rito.
            </span>
          </>
        );
        setTimeout(() => setMessage(''), 3000);
      } else if (err.response?.data?.error) {
        setMessage(`${err.response.data.error}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('May naging problema. Subukan muli mamaya.');
        setTimeout(() => setMessage(''), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  // === RESET PASSWORD ===
  const handleResetPassword = async () => {
    setMessage('');

    if (!otp || !newPassword || !confirmPassword) {
      setMessage('Lahat ng impormasyon ay kailangan.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setMessage('Kailangan ang password ay may 8+ characters, may malaking titik, maliit na titik, at numero.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Hindi pareho ang inilagay mong password.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://scf-backend-92qq.onrender.com/SeniorConnect/sc_reset_password/', {
        email,
        otp,
        new_password: newPassword,
      });
      setMessage('Tagumpay ang pag-reset ng password mo. Pwede ka nang mag-login.');
      setTimeout(() => {
        setStep(1);
        setMessage('');
      }, 2000);
    } catch (err) {
      setMessage('Hindi wasto ang OTP o nag-expire na ang link.');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    transition: 'all 0.3s',
    outline: 'none'
  };

  const buttonStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#f9fafb'
    }}>
      {/* LEFT SIDE - Image Slideshow (Desktop only) */}
      {!isMobile && (
        <div style={{
          flex: 1,
          position: 'relative',
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.7), rgba(59, 130, 246, 0.7)), url(${images[currentImage]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '3rem',
          transition: 'background-image 1s ease-in-out'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: '1.2' }}>
              Welcome to SeniorConnect
            </h1>
            <p style={{ fontSize: '1.25rem', lineHeight: '1.8', opacity: 0.95 }}>
              Connecting and empowering senior citizens through digital access and community support.
            </p>
          </div>
        </div>
      )}

      {/* RIGHT SIDE - Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '2rem 1.5rem' : '3rem',
        backgroundColor: 'white'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px'
        }}>
          {/* Logo */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2.5rem'
          }}>
            <div style={{
              width: isMobile ? '80px' : '100px',
              height: isMobile ? '80px' : '100px',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <img 
                src="/images/logo.png"  // or yung path ng logo mo
                alt="SeniorConnect Logo"
                style={{
                  width: isMobile ? '80px' : '100px',
                  height: isMobile ? '80px' : '100px',
                  margin: '0 auto 1.5rem',
                  objectFit: 'contain'  // para hindi distorted
                }}
              />
            </div>
            <h2 style={{
              fontSize: isMobile ? '1.75rem' : '2rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              {step === 1 && 'Login to SeniorConnect'}
              {step === 2 && 'Forgot Password'}
              {step === 3 && 'Reset Password'}
            </h2>
            <p style={{ color: '#6b7280', fontSize: isMobile ? '0.95rem' : '1rem' }}>
              {step === 1 && 'Enter your credentials to continue'}
              {step === 2 && 'We\'ll send you a reset code'}
              {step === 3 && 'Create your new password'}
            </p>
          </div>

          {/* LOGIN FORM */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Password
                </label>
                <input
                  type="password"
                  name="sc-login-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  onClick={() => setStep(2)}
                  style={{
                    color: '#2563eb',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  Nakalimutan ang password?
                </span>
              </div>

              {message && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.75rem',
                  color: '#991b1b',
                  fontSize: '0.95rem'
                }}>
                  {message}
                </div>
              )}

              <button
                onClick={handleLoginClick}
                disabled={loading}
                style={{
                  ...buttonStyle,
                  backgroundColor: loading ? '#93c5fd' : '#2563eb',
                  color: 'white'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
              >
                {loading ? 'Nagla-log in...' : 'Mag-login'}
              </button>

              <div style={{
                textAlign: 'center',
                padding: '1rem 0',
                color: '#6b7280',
                fontSize: '0.95rem'
              }}>
                Wala ka pang account?{' '}
                <span
                  onClick={() => navigate('/CCreateAcc')}
                  style={{
                    color: '#2563eb',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  Gumawa ng account
                </span>
              </div>

              <div style={{
                textAlign: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
                color: '#6b7280',
                fontSize: '0.9rem'
              }}>
                Are you an admin?{' '}
                <span
                  onClick={() => navigate('/AdminLogin')}
                  style={{
                    color: '#2563eb',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  Login as Admin
                </span>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <p style={{
                padding: '1rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '0.75rem',
                color: '#1e40af',
                fontSize: '0.9rem',
                margin: 0
              }}>
                Magpapadala kami ng One-Time Password (OTP) sa inyong Gmail.
              </p>

              {message && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.75rem',
                  color: '#991b1b',
                  fontSize: '0.95rem'
                }}>
                  {message}
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                style={{
                  ...buttonStyle,
                  backgroundColor: loading ? '#93c5fd' : '#2563eb',
                  color: 'white'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
              >
                {loading ? 'Ipinapadala...' : 'Ipadala ang OTP'}
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setMessage('');
                }}
                style={{
                  ...buttonStyle,
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                Bumalik sa Login
              </button>
            </div>
          )}

          {/* RESET PASSWORD FORM */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <p style={{
                padding: '1rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '0.75rem',
                color: '#1e40af',
                fontSize: '0.9rem',
                margin: 0
              }}>
                Ang password ay dapat may hindi bababa sa 8 letra, at may kasamang malaking letra, maliit na letra, at numero.
              </p>

              {message && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.75rem',
                  color: '#991b1b',
                  fontSize: '0.95rem'
                }}>
                  {message}
                </div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={loading}
                style={{
                  ...buttonStyle,
                  backgroundColor: loading ? '#93c5fd' : '#2563eb',
                  color: 'white'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
              >
                {loading ? 'Nire-reset...' : 'I-reset ang Password'}
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setMessage('');
                }}
                style={{
                  ...buttonStyle,
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                Bumalik sa Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}