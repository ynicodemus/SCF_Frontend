import React, { useState } from 'react';
import './css/adminforgotpass.css'; // ✅ Reuse same CSS

function AdminVerifyOTP({ email, onVerified }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('https://scf-backend-92qq.onrender.com/admins/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        onVerified(email);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-forgot-container"> {/* ✅ Centers the card */}
      <div className="admin-forgot-card">     {/* ✅ Same card layout */}
        <h2>Verify OTP</h2>
        <p className="admin-forgot-text">
          Please enter the 6-digit OTP sent to <strong>your Email</strong>.
        </p>

        <form onSubmit={handleVerify} className="admin-forgot-form">
          <label htmlFor="otp">OTP Code</label>
          <input
            type="text"
            id="otp"
            placeholder="Enter OTP"
            value={otp}
            required
            onChange={(e) => setOtp(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            className="admin-cancel-btn"
            onClick={() => window.location.href = '/AdminLogin'}
          >
            Cancel
          </button>
        </form>

        {message && <p className="admin-success-message">{message}</p>}
        {error && <p className="admin-error-message">{error}</p>}

        <p className="admin-forgot-text" style={{ textAlign: 'center', marginTop: '15px' }}>
          📧 Check your <strong>Gmail Inbox</strong> or <strong>Spam folder</strong> for the OTP.<br />
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '600' }}
          >
            Open Gmail
          </a>
        </p>
      </div>
    </div>
  );
}

export default AdminVerifyOTP;
