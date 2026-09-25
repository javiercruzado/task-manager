import React from 'react';
import { CheckCircle2, Zap, Shield, Tags } from 'lucide-react';

export const BrandPanel: React.FC = () => {
  return (
    <aside className="brand-panel">
      <div className="brand-header">
        <div className="brand-logo-icon">
          <CheckCircle2 size={24} />
        </div>
        <span className="brand-title">TaskManager</span>
      </div>

      <div className="brand-pitch">
        <span className="pitch-badge">Modern Workspace</span>
        <h2 className="pitch-headline">Organize, Track & Deliver Faster.</h2>
        <p className="pitch-subtext">
          A high-performance task management system built for engineering teams and ambitious individuals.
        </p>
      </div>

      <div className="brand-features">
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Zap size={18} />
          </div>
          <div>
            <strong>Lightning-Fast Tracking</strong>
            <p>Kanban drag-and-drop & keyboard-first navigation.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Tags size={18} />
          </div>
          <div>
            <strong>Multi-Project Workspaces</strong>
            <p>Organize projects with custom priority colors & tags.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Shield size={18} />
          </div>
          <div>
            <strong>Enterprise-Grade Security</strong>
            <p>Robust JWT rotation, BCrypt encryption & rate limiting.</p>
          </div>
        </div>
      </div>

      <div className="brand-footer">
        <p>© 2026 TaskManager Platform. All rights reserved.</p>
      </div>
    </aside>
  );
};
