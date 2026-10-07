import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { registerUser, AuthApiError } from '../services/authService';
import type { RegisterFormData } from '../types/auth';

interface Props {
  onSuccess: (email: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<Props> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: true,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateField = (name: string, value: string | boolean): string => {
    switch (name) {
      case 'fullName':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return 'Full name is required';
        }
        if (value.trim().length > 100) {
          return 'Full name cannot exceed 100 characters';
        }
        return '';
      case 'email':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return 'Email address is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'password':
        if (!value || typeof value !== 'string') {
          return 'Password is required';
        }
        if (value.length < 8) {
          return 'Password must be at least 8 characters long';
        }
        return '';
      case 'confirmPassword':
        if (!value || typeof value !== 'string') {
          return 'Please confirm your password';
        }
        if (value !== formData.password) {
          return 'Passwords do not match';
        }
        return '';
      case 'termsAccepted':
        if (!value) {
          return 'You must accept the terms of service';
        }
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, (formData as any)[field]);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const next = { ...prev, [name]: val };
      if (touched[name]) {
        const error = validateField(name, val);
        setFieldErrors((errs) => ({ ...errs, [name]: error }));
      }
      if (name === 'password' && touched.confirmPassword) {
        const confirmErr = next.confirmPassword !== val ? 'Passwords do not match' : '';
        setFieldErrors((errs) => ({ ...errs, confirmPassword: confirmErr }));
      }
      return next;
    });

    if (generalError) setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const errors: Record<string, string> = {
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      termsAccepted: validateField('termsAccepted', formData.termsAccepted),
    };

    setFieldErrors(errors);
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });

    const hasErrors = Object.values(errors).some((err) => Boolean(err));
    if (hasErrors) {
      setGeneralError('Please resolve the highlighted issues before proceeding.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      onSuccess(formData.email.trim());
    } catch (err: unknown) {
      if (err instanceof AuthApiError) {
        if (err.fieldErrors) {
          setFieldErrors((prev) => ({ ...prev, ...err.fieldErrors }));
        }
        setGeneralError(err.message);
      } else {
        setGeneralError('An unexpected error occurred during registration. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-form-container">
      <header className="form-header">
        <h1 className="form-title">Create your account</h1>
        <p className="form-subtitle">
          Start managing projects and tasks with precision. Already registered?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="auth-switch-btn"
          >
            Sign in
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
        {/* Full Name Field */}
        <div className="form-field-group">
          <label htmlFor="fullName" className="field-label">
            Full Name
          </label>
          <div className="field-input-box">
            <User size={18} className="field-prefix-icon" />
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="e.g. Maya Chen"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={() => handleBlur('fullName')}
              className={`text-input ${fieldErrors.fullName ? 'has-error' : touched.fullName ? 'is-valid' : ''}`}
              maxLength={100}
              autoComplete="name"
              disabled={isSubmitting}
            />
          </div>
          {fieldErrors.fullName && <span className="field-error-text">{fieldErrors.fullName}</span>}
        </div>

        {/* Email Address Field */}
        <div className="form-field-group">
          <label htmlFor="email" className="field-label">
            Email Address
          </label>
          <div className="field-input-box">
            <Mail size={18} className="field-prefix-icon" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={`text-input ${fieldErrors.email ? 'has-error' : touched.email ? 'is-valid' : ''}`}
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>
          {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
        </div>

        {/* Password Field */}
        <div className="form-field-group">
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <div className="field-input-box">
            <Lock size={18} className="field-prefix-icon" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              className={`text-input ${fieldErrors.password ? 'has-error' : touched.password && !fieldErrors.password ? 'is-valid' : ''}`}
              autoComplete="new-password"
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

          {/* Password Strength Meter */}
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        {/* Confirm Password Field */}
        <div className="form-field-group">
          <label htmlFor="confirmPassword" className="field-label">
            Confirm Password
          </label>
          <div className="field-input-box">
            <Lock size={18} className="field-prefix-icon" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              className={`text-input ${fieldErrors.confirmPassword ? 'has-error' : touched.confirmPassword && !fieldErrors.confirmPassword ? 'is-valid' : ''}`}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle-btn"
              aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <span className="field-error-text">{fieldErrors.confirmPassword}</span>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="terms-checkbox-wrapper">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              disabled={isSubmitting}
              className="checkbox-input"
            />
            <span className="checkbox-text">
              I agree to the <a href="#terms">Terms of Service</a> and{' '}
              <a href="#privacy">Privacy Policy</a>
            </span>
          </label>
          {fieldErrors.termsAccepted && (
            <span className="field-error-text">{fieldErrors.termsAccepted}</span>
          )}
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
