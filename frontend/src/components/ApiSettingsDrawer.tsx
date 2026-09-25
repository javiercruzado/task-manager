import React, { useState } from 'react';
import { Settings, Check, Globe } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl } from '../services/authService';

export const ApiSettingsDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState(getApiBaseUrl() || 'http://localhost:8080');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(url);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsOpen(false);
    }, 1200);
  };

  const handleResetDefault = () => {
    setApiBaseUrl('');
    setUrl('http://localhost:8080');
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="api-settings-container">
      <div className="api-settings-summary">
        <div className="api-status-indicator">
          <span className="api-indicator-dot"></span>
          <span className="api-summary-text">
            API: <strong>{getApiBaseUrl() || 'http://localhost:8080 (proxy)'}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="api-config-button"
          aria-label="Configure backend API endpoint"
        >
          <Settings size={14} />
          <span>{isOpen ? 'Close' : 'Configure API'}</span>
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSave} className="api-settings-form">
          <label htmlFor="api-url-field" className="api-field-label">
            <Globe size={14} />
            <span>Backend Server URL</span>
          </label>
          <div className="api-input-row">
            <input
              id="api-url-field"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8080"
              className="api-text-input"
            />
            <button type="submit" className="api-save-btn">
              {saved ? <Check size={16} /> : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleResetDefault}
              className="api-reset-btn"
              title="Reset to default"
            >
              Reset
            </button>
          </div>
          <small className="api-tip">
            Using Vite dev proxy (`/api`) by default forwards to port 8080.
          </small>
        </form>
      )}
    </div>
  );
};
