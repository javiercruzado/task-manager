import React from 'react';
import { CheckCircle2, Mail, ArrowRight, RefreshCw } from 'lucide-react';

interface Props {
  email: string;
  onReset: () => void;
}

export const RegistrationSuccess: React.FC<Props> = ({ email, onReset }) => {
  return (
    <div className="success-screen-wrapper">
      <div className="success-icon-container">
        <div className="success-pulse-ring"></div>
        <CheckCircle2 size={48} className="success-check-icon" />
      </div>

      <h2 className="success-headline">Registration Successful!</h2>

      <p className="success-description">
        We have created your account and dispatched an activation link to:
      </p>

      <div className="email-pill-box">
        <Mail size={18} className="mail-pill-icon" />
        <span className="email-pill-text">{email}</span>
      </div>

      <div className="info-callout">
        <strong>Next Step:</strong>
        <p>
          Click the verification link in the email to activate your account. Once verified, you can log in to your dashboard.
        </p>
      </div>

      <div className="success-button-group">
        <button type="button" onClick={onReset} className="btn-secondary-action">
          <RefreshCw size={16} />
          <span>Register Another User</span>
        </button>

        <a href="#login" className="btn-primary-action">
          <span>Go to Login</span>
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
};
