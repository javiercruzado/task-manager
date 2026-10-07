import React, { useEffect, useState } from 'react';
import { User, LogOut, ShieldCheck, Key, Copy, Check, Calendar, Mail, Loader2 } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../services/authService';
import type { AuthResponse, UserResponse } from '../types/auth';

interface Props {
  tokens: AuthResponse;
  userEmail: string;
  onLogout: () => void;
}

export const UserDashboard: React.FC<Props> = ({ tokens, userEmail, onLogout }) => {
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (tokens.accessToken) {
      getCurrentUser(tokens.accessToken)
        .then((data) => {
          if (isMounted) setProfile(data);
        })
        .catch((err) => {
          console.warn('Failed to load profile details:', err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [tokens.accessToken]);

  const handleCopyToken = () => {
    if (tokens.accessToken) {
      navigator.clipboard.writeText(tokens.accessToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await logoutUser(tokens.refreshToken);
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  };

  const displayName = profile?.fullName || userEmail.split('@')[0];
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="dashboard-view-container">
      <div className="dashboard-header-card">
        <div className="dashboard-avatar">{initials || <User size={24} />}</div>

        <div className="dashboard-user-meta">
          <div className="dashboard-user-name-row">
            <h2 className="dashboard-user-name">{displayName}</h2>
            <span className="account-status-badge">
              <ShieldCheck size={14} />
              <span>Authenticated</span>
            </span>
          </div>
          <p className="dashboard-user-email">
            <Mail size={14} />
            <span>{userEmail}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading-state">
          <Loader2 size={24} className="spin-icon" />
          <span>Fetching account profile...</span>
        </div>
      ) : (
        <div className="dashboard-details-grid">
          {profile?.createdAt && (
            <div className="dashboard-stat-card">
              <span className="stat-label">
                <Calendar size={14} />
                <span>Member Since</span>
              </span>
              <strong className="stat-value">
                {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </strong>
            </div>
          )}

          <div className="dashboard-stat-card token-card">
            <div className="stat-label-row">
              <span className="stat-label">
                <Key size={14} />
                <span>JWT Access Token</span>
              </span>
              <button
                type="button"
                onClick={handleCopyToken}
                className="copy-token-btn"
                title="Copy JWT Token"
              >
                {copiedToken ? (
                  <>
                    <Check size={12} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <code className="token-preview">
              {tokens.accessToken
                ? `${tokens.accessToken.slice(0, 28)}...${tokens.accessToken.slice(-12)}`
                : 'No access token available'}
            </code>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={loggingOut}
          className="btn-signout-action"
        >
          {loggingOut ? <Loader2 size={16} className="spin-icon" /> : <LogOut size={16} />}
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );
};
