import React, { useState } from 'react';
import './css/adminforgotpass.css';

function AdminForgotPassword({ onOTPSent }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('https://scf-backend-92qq.onrender.com/admins/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage(data.message);
        onOTPSent(email);
      } else {
        if (data.error && data.error.toLowerCase().includes('email not found')) {
          setError('Invalid email account');
        } else {
          setError(data.error || 'Failed to send OTP');
        }
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="admin-forgot-container">
      <div className="admin-forgot-card">
        <h2>Forgot Password</h2>
        <p className="admin-forgot-text">
          Are you requesting to reset your password? Kindly enter your Gmail address below.
        </p>

        <form onSubmit={handleSubmit} className="admin-forgot-form">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            placeholder="Enter your email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Send OTP</button>

          <button
            type="button"
            className="admin-cancel-btn"
            onClick={() => window.location.href = '/AdminLogin'} // or navigate('/AdminLogin')
          >
            Cancel
          </button>

        </form>

        {message && <p className="admin-success-message">{message}</p>}
        {error && <p className="admin-error-message">{error}</p>}
      </div>
    </div>
  );
}

export default AdminForgotPassword;
