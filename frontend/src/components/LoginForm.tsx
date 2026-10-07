import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { loginUser, AuthApiError } from '../services/authService';
import type { AuthResponse } from '../types/auth';

interface Props {
  onSuccess: (tokens: AuthResponse, email: string) => void;
  onSwitchToRegister: () => void;
  initialEmail?: string;
}

export const LoginForm: React.FC<Props> = ({ onSuccess, onSwitchToRegister, initialEmail = '' }) => {
  const [email, setEmail] = useState(() => {
    return initialEmail || localStorage.getItem('taskmanager_remembered_email') || '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateField = (name: string, value: string): string => {
    if (name === 'email') {
      if (!value.trim()) return 'Email address is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return 'Please enter a valid email address';
      }
      return '';
    }
    if (name === 'password') {
      if (!value) return 'Password is required';
      return '';
    }
    return '';
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, field === 'email' ? email : password);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const emailErr = validateField('email', email);
    const pwdErr = validateField('password', password);

    setFieldErrors({ email: emailErr, password: pwdErr });
    setTouched({ email: true, password: true });

    if (emailErr || pwdErr) {
      setGeneralError('Please enter both your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      if (rememberMe) {
        localStorage.setItem('taskmanager_remembered_email', email.trim());
      } else {
        localStorage.removeItem('taskmanager_remembered_email');
      }

      onSuccess(response, email.trim());
    } catch (err: unknown) {
      if (err instanceof AuthApiError) {
        if (err.fieldErrors) {
          setFieldErrors((prev) => ({ ...prev, ...err.fieldErrors }));
        }
        setGeneralError(err.message);
      } else {
        setGeneralError('An unexpected error occurred while signing in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <header className="form-header">
        <h1 className="form-title">Welcome back</h1>
        <p className="form-subtitle">
          Enter your credentials to access your workspaces.{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="auth-switch-btn"
          >
            Create an account
          </button>
        </p>
      </header>

      {generalError && (
        <div className="alert-banner-error" role="alert">
          <AlertCircle size={18} className="alert-icon" />
          <div className="alert-content">{generalError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="registration-form">
        {/* Email Field */}
        <div className="form-field-group">
          <label htmlFor="login-email" className="field-label">
            Email Address
          </label>
          <div className="field-input-box">
            <Mail size={18} className="field-prefix-icon" />
            <input
              id="login-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  setFieldErrors((prev) => ({ ...prev, email: validateField('email', e.target.value) }));
                }
                if (generalError) setGeneralError(null);
              }}
              onBlur={() => handleBlur('email')}
              className={`text-input ${fieldErrors.email ? 'has-error' : touched.email && !fieldErrors.email ? 'is-valid' : ''}`}
              autoComplete="username"
              disabled={isSubmitting}
            />
          </div>
          {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
        </div>

        {/* Password Field */}
        <div className="form-field-group">
          <div className="field-label-row">
            <label htmlFor="login-password" className="field-label">
              Password
            </label>
            <span className="forgot-password-link" title="Password reset requires account verification">
              Forgot password?
            </span>
          </div>
          <div className="field-input-box">
            <Lock size={18} className="field-prefix-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) {
                  setFieldErrors((prev) => ({ ...prev, password: validateField('password', e.target.value) }));
                }
                if (generalError) setGeneralError(null);
              }}
              onBlur={() => handleBlur('password')}
              className={`text-input ${fieldErrors.password ? 'has-error' : touched.password && !fieldErrors.password ? 'is-valid' : ''}`}
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-btn"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
        </div>

        {/* Remember me & Options */}
        <div className="login-options-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
              className="checkbox-input"
            />
            <span className="checkbox-text">Remember this email</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`submit-action-btn ${isSubmitting ? 'loading' : ''}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="spin-icon" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
