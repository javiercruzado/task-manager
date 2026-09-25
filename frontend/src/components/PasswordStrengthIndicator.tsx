import React from 'react';
import { Check, X } from 'lucide-react';

interface Props {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<Props> = ({ password }) => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteria = [
    { label: '8+ characters', met: hasMinLength },
    { label: 'Uppercase letter', met: hasUppercase },
    { label: 'Lowercase letter', met: hasLowercase },
    { label: 'Number (0-9)', met: hasNumber },
    { label: 'Special character', met: hasSpecial },
  ];

  const score = criteria.filter((c) => c.met).length;

  const getStrengthMeta = () => {
    if (!password) return { label: 'Enter a secure password', color: 'var(--text-muted)' };
    if (score <= 2) return { label: 'Weak', color: '#ef4444' };
    if (score === 3) return { label: 'Fair', color: '#f59e0b' };
    if (score === 4) return { label: 'Good', color: '#3b82f6' };
    return { label: 'Strong', color: '#10b981' };
  };

  const strengthMeta = getStrengthMeta();

  return (
    <div className="pwd-strength-block">
      <div className="pwd-strength-header">
        <span className="strength-title">Password Strength</span>
        <span className="strength-status" style={{ color: strengthMeta.color }}>
          {strengthMeta.label}
        </span>
      </div>

      <div className="strength-meter-bar">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className="strength-meter-segment"
            style={{
              backgroundColor: password && level <= score ? strengthMeta.color : 'var(--border)',
            }}
          />
        ))}
      </div>

      <div className="strength-rules-grid">
        {criteria.map((c, i) => (
          <div key={i} className={`rule-chip ${c.met ? 'met' : ''}`}>
            {c.met ? <Check size={12} className="rule-icon check" /> : <X size={12} className="rule-icon cross" />}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
