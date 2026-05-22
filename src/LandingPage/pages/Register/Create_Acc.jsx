import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateAccCitizen() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Step 1 - send OTP
  const handleSendOtp = async () => {
    if (!email) {
      setMessage("Kailangan ang email.");
      return;
    }
  
    setLoading(true);
    setMessage("");
  
    try {
      await axios.post("https://scf-backend-92qq.onrender.com/SeniorConnect/sc_send_otp/", { email });
      setStep(2);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        const backendError = err.response.data.error;
  
        if (
          backendError.includes("already exists") ||
          backendError.includes("already registered")
        ) {
          setMessage(
            "Gamit na ang Gmail na ito. Hindi ka makakagawa ng panibagong account gamit ang email na ito."
          );
        } else {
          setMessage(`${backendError}`);
        }
      } else if (err.request) {
        setMessage("Hindi makakonekta sa server. Suriin ang inyong internet connection.");
      } else {
        setMessage("May hindi inaasahang error. Subukan muli.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2 - verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage("Ilagay ang OTP.");
      setMessageType("info");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await axios.post("https://scf-backend-92qq.onrender.com/SeniorConnect/sc_verify_otp/", { email, otp });
      setMessage("");      // <-- clear first
      setTimeout(() => {   // <-- allow re-render before setting success
        setMessage("Na-verify ang OTP!");
        setMessageType("success");
      }, 10);

      setStep(3);
    } catch (err) {
      setMessage("Mali o expired ang OTP. Subukan muli.");
      setMessageType("error");
      setOtp("");          
    }
    setLoading(false);
  };

  const handleSetPassword = async () => {
    if (!password || !confirmPassword) {
      setMessage("Punan ang lahat ng hinihinging impormasyon.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      setMessage(
        "Ang password ay dapat may hindi bababa sa 8 letra, at may kasamang malaking letra, maliit na letra, at numero."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Hindi magkatugma ang mga password.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await axios.post("https://scf-backend-92qq.onrender.com/SeniorConnect/sc_set_password/", {
        email,
        password,
      });
      setMessage("Matagumpay na nagawa ang account!");
      setTimeout(() => navigate("/Account"), 1500);
    } catch (err) {
      setMessage("Hindi nagtagumpay ang paglikha ng account. Subukan muli.");
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
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: isMobile ? '2rem 1.5rem' : '3rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        padding: isMobile ? '2.5rem 2rem' : '3rem'
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: isMobile ? '70px' : '80px',
            height: isMobile ? '70px' : '80px',
            margin: '0 auto 1rem',
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
            fontSize: isMobile ? '1.5rem' : '1.75rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Gumawa ng Account
          </h2>
          <p style={{ color: '#6b7280', fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
            {step === 1 && 'Ilagay ang inyong email address'}
            {step === 2 && 'I-verify ang inyong email'}
            {step === 3 && 'Gumawa ng secure password'}
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                backgroundColor: step >= num ? '#2563eb' : '#e5e7eb',
                color: step >= num ? 'white' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* STEP 1 - Email */}
        {step === 1 && (
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
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
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
              onClick={() => navigate(-1)}
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

        {/* STEP 2 - Verify OTP */}
        {step === 2 && (
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
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <p style={{
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                Tingnan ang iyong Gmail para sa OTP.
              </p>
            </div>

            {message && (
              <div
                style={{
                  padding: '1rem',
                  textAlign: "center",
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',

                  backgroundColor:
                    messageType === "success"
                      ? "#f0fdf4"
                      : messageType === "error"
                      ? "#fef2f2"
                      : "#eff6ff",

                  border:
                    messageType === "success"
                      ? "1px solid #bbf7d0"
                      : messageType === "error"
                      ? "1px solid #fecaca"
                      : "1px solid #bfdbfe",

                  color:
                    messageType === "success"
                      ? "#166534"
                      : messageType === "error"
                      ? "#991b1b"
                      : "#1e40af",
                }}
              >
                {message}
              </div>
            )}



            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              style={{
                ...buttonStyle,
                backgroundColor: loading ? '#93c5fd' : '#2563eb',
                color: 'white'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
            >
              {loading ? 'Vine-verify...' : 'I-verify ang OTP'}
            </button>

            <button
              onClick={() => navigate(-1)}
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

        {/* STEP 3 - Set Password */}
        {step === 3 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSetPassword();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <p style={{
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                Ang password ay dapat may hindi bababa sa 8 letra, at may kasamang malaking letra, maliit na letra, at numero.
              </p>
            </div>

            {message && (
              <div
                style={{
                  padding: '1rem',
                  textAlign: "center",
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',

                  backgroundColor:
                    messageType === "success"
                      ? "#f0fdf4"
                      : messageType === "error"
                      ? "#fef2f2"
                      : "#eff6ff",

                  border:
                    messageType === "success"
                      ? "1px solid #bbf7d0"
                      : messageType === "error"
                      ? "1px solid #fecaca"
                      : "1px solid #bfdbfe",

                  color:
                    messageType === "success"
                      ? "#166534"
                      : messageType === "error"
                      ? "#991b1b"
                      : "#1e40af",
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                backgroundColor: loading ? '#93c5fd' : '#2563eb',
                color: 'white'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
            >
              {loading ? 'Sine-save...' : 'I-set ang Password'}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
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
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateAccCitizen;