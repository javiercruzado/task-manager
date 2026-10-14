import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { BrandPanel } from './components/BrandPanel';
import { RegisterForm } from './components/RegisterForm';
import { LoginForm } from './components/LoginForm';
import { RegistrationSuccess } from './components/RegistrationSuccess';
import { UserDashboard } from './components/UserDashboard';
import { ApiSettingsDrawer } from './components/ApiSettingsDrawer';
import { getTokens, clearTokens } from './services/authService';
import type { AuthResponse } from './types/auth';
import './App.css';

type AuthView = 'login' | 'register' | 'registered-success' | 'dashboard';

export const App: React.FC = () => {
  const [view, setView] = useState<AuthView>(() => {
    const existing = getTokens();
    if (existing.accessToken) return 'dashboard';
    return 'login';
  });

  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [authTokens, setAuthTokens] = useState<AuthResponse>(() => getTokens());
  const [activeUserEmail, setActiveUserEmail] = useState<string>(() => {
    return localStorage.getItem('taskmanager_remembered_email') || '';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('taskmanager_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskmanager_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleRegistrationSuccess = (email: string) => {
    setRegisteredEmail(email);
    setView('registered-success');
  };

  const handleLoginSuccess = (tokens: AuthResponse, email: string) => {
    setAuthTokens(tokens);
    setActiveUserEmail(email);
    setView('dashboard');
  };

  const handleLogout = () => {
    clearTokens();
    setAuthTokens({ accessToken: null, refreshToken: null });
    setView('login');
  };

  return (
    <div className="app-viewport">
      {/* Top utility bar */}
      <div className="top-utility-bar">
        {view !== 'dashboard' && (
          <div className="auth-tab-switch">
            <button
              type="button"
              onClick={() => setView('login')}
              className={`auth-tab-btn ${view === 'login' ? 'active' : ''}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setView('register')}
              className={`auth-tab-btn ${view === 'register' ? 'active' : ''}`}
            >
              Register
            </button>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="theme-switch-btn"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Main card container */}
      <div className={`app-card-wrapper ${view === 'dashboard' ? 'dashboard-mode' : ''}`}>
        {view !== 'dashboard' && <BrandPanel />}

        <main className={`form-panel-content ${view === 'dashboard' ? 'dashboard-panel-content' : ''}`}>
          {view === 'login' && (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setView('register')}
              initialEmail={registeredEmail || activeUserEmail}
            />
          )}

          {view === 'register' && (
            <RegisterForm
              onSuccess={handleRegistrationSuccess}
              onSwitchToLogin={() => setView('login')}
            />
          )}

          {view === 'registered-success' && (
            <RegistrationSuccess
              email={registeredEmail}
              onReset={() => setView('register')}
              onGoToLogin={() => setView('login')}
            />
          )}

          {view === 'dashboard' && (
            <UserDashboard
              tokens={authTokens}
              userEmail={activeUserEmail}
              onLogout={handleLogout}
            />
          )}

          <ApiSettingsDrawer />
        </main>
      </div>
    </div>
  );
};

export default App;
