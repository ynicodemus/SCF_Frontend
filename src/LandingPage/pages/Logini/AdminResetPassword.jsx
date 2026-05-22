import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // ✅ real icons
import { useNavigate } from "react-router-dom";



function AdminResetPassword({ email }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://scf-backend-92qq.onrender.com/admins/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password reset successful!');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/AdminLogin');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-forgot-container">
      <div className="admin-forgot-card">
        <h2>Reset Password</h2>
        <p className="admin-forgot-text">
          Enter your new password below to complete the reset process for <strong>{email}</strong>.
        </p>

        <form onSubmit={handleReset} className="admin-forgot-form">
          {/* === NEW PASSWORD === */}
          <label>New Password</label>
          <div className="admin-password-input">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              required
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* === CONFIRM PASSWORD === */}
          <label>Confirm Password</label>
          <div className="admin-password-input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-type new password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* ✅ Password hint */}
          <p className="admin-password-hint">
            💡 Make sure your password has at least 8 characters, 
            including uppercase, lowercase, and a number.
          </p>

          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

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
      </div>
    </div>
  );
}

export default AdminResetPassword;
