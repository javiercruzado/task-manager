import React, { useEffect, useState } from 'react';
import {
  User,
  LogOut,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Calendar,
  Mail,
  Loader2,
  Kanban,
  Settings,
} from 'lucide-react';
import { ProjectsManager } from './ProjectsManager';
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
  const [activeTab, setActiveTab] = useState<'workspace' | 'account'>('workspace');

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
    <div className="dashboard-container">
      {/* Dashboard Top Header Navigation */}
      <header className="dashboard-top-nav">
        <div className="dashboard-profile-summary">
          <div className="dashboard-avatar-badge">{initials || <User size={18} />}</div>
          <div className="profile-text-group">
            <span className="profile-greeting">Signed in as</span>
            <strong className="profile-name">{displayName}</strong>
          </div>
        </div>

        <nav className="dashboard-nav-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('workspace')}
            className={`dashboard-nav-tab ${activeTab === 'workspace' ? 'active' : ''}`}
          >
            <Kanban size={15} />
            <span>Projects & Tasks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`dashboard-nav-tab ${activeTab === 'account' ? 'active' : ''}`}
          >
            <Settings size={15} />
            <span>Account Details</span>
          </button>
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={loggingOut}
          className="btn-dashboard-signout"
          title="Sign out of your account"
        >
          {loggingOut ? <Loader2 size={15} className="spin-icon" /> : <LogOut size={15} />}
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Tab Content */}
      <main className="dashboard-main-content">
        {activeTab === 'workspace' ? (
          <ProjectsManager token={tokens.accessToken || ''} />
        ) : (
          /* Account Settings View */
          <div className="account-details-view">
            <div className="dashboard-header-card">
              <div className="dashboard-avatar">{initials || <User size={24} />}</div>

              <div className="dashboard-user-meta">
                <div className="dashboard-user-name-row">
                  <h2 className="dashboard-user-name">{displayName}</h2>
                  <span className="account-status-badge">
                    <ShieldCheck size={14} />
                    <span>{profile?.enabled ? 'Active & Verified' : 'Authenticated'}</span>
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
                <span>Fetching profile information...</span>
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
                      ? `${tokens.accessToken.slice(0, 32)}...${tokens.accessToken.slice(-14)}`
                      : 'No access token available'}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
