import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { BrandPanel } from './components/BrandPanel';
import { RegisterForm } from './components/RegisterForm';
import { RegistrationSuccess } from './components/RegistrationSuccess';
import { ApiSettingsDrawer } from './components/ApiSettingsDrawer';
import './App.css';

export const App: React.FC = () => {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
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
  };

  const handleResetForm = () => {
    setRegisteredEmail(null);
  };

  return (
    <div className="app-viewport">
      {/* Top utility bar */}
      <div className="top-utility-bar">
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
      <div className="app-card-wrapper">
        <BrandPanel />

        <main className="form-panel-content">
          {registeredEmail ? (
            <RegistrationSuccess email={registeredEmail} onReset={handleResetForm} />
          ) : (
            <RegisterForm onSuccess={handleRegistrationSuccess} />
          )}

          <ApiSettingsDrawer />
        </main>
      </div>
    </div>
  );
};

export default App;
