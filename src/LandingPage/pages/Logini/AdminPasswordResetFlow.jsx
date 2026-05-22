import React, { useState } from 'react';
import AdminForgotPassword from './AdminForgotPassword';
import AdminVerifyOTP from './AdminVerifyOTP';
import AdminResetPassword from './AdminResetPassword';
import './css/adminforgotpass.css'; // ✅ reuse same CSS as login

function AdminPasswordResetFlow() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('forgot-password');

  const handleOTPSent = (userEmail) => {
    setEmail(userEmail);
    setStep('verify-otp');
  };

  const handleOTPVerified = (userEmail) => {
    setEmail(userEmail);
    setStep('reset-password');
  };

  return (
    <div className="admin-login-container">
      {/* Left Side - same background image */}
      <div className="admin-login-image"></div>

      {/* Right Side - form area */}
      <div className="admin-login-form">
        {step === 'forgot-password' && <AdminForgotPassword onOTPSent={handleOTPSent} />}
        {step === 'verify-otp' && <AdminVerifyOTP email={email} onVerified={handleOTPVerified} />}
        {step === 'reset-password' && <AdminResetPassword email={email} />}
      
      
      </div>
    </div>
  );
}

export default AdminPasswordResetFlow;
