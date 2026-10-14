import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Edit3, AlertCircle, Loader2 } from 'lucide-react';
import { createProject, updateProject } from '../services/projectService';
import type { ProjectRequest, ProjectResponse } from '../types/project';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  projectToEdit?: ProjectResponse | null;
  onProjectSaved: (project: ProjectResponse) => void;
}

export const ProjectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  token,
  projectToEdit,
  onProjectSaved,
}) => {
  const isEditing = Boolean(projectToEdit);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setNameError('');
    setGeneralError(null);
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    if (!name.trim()) {
      setNameError('Project name is required');
      return false;
    }
    if (name.trim().length > 100) {
      setNameError('Project name cannot exceed 100 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    const payload: ProjectRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    try {
      let savedProject: ProjectResponse;
      if (isEditing && projectToEdit) {
        savedProject = await updateProject(token, projectToEdit.id, payload);
      } else {
        savedProject = await createProject(token, payload);
      }
      onProjectSaved(savedProject);
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred while saving the project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              {isEditing ? <Edit3 size={20} /> : <FolderPlus size={20} />}
            </div>
            <div>
              <h3 className="modal-title">{isEditing ? 'Edit Project' : 'Create New Project'}</h3>
              <p className="modal-subtitle">
                {isEditing ? 'Update project details and scope' : 'Set up a workspace for your team tasks'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {generalError && (
          <div className="modal-alert-error">
            <AlertCircle size={18} className="alert-icon" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="modal-form">
          <div className="form-field-group">
            <div className="field-label-row">
              <label htmlFor="project-name" className="field-label">
                Project Name <span className="required-star">*</span>
              </label>
              <span className={`char-counter ${name.length > 90 ? 'warning' : ''}`}>
                {name.length}/100
              </span>
            </div>
            <input
              id="project-name"
              type="text"
              placeholder="e.g. Website Revamp 2026"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
                if (generalError) setGeneralError(null);
              }}
              onBlur={validate}
              maxLength={100}
              className={`text-input ${nameError ? 'has-error' : ''}`}
              autoFocus
              disabled={isSubmitting}
            />
            {nameError && <span className="field-error-text">{nameError}</span>}
          </div>

          <div className="form-field-group">
            <label htmlFor="project-description" className="field-label">
              Description <span className="optional-tag">(Optional)</span>
            </label>
            <textarea
              id="project-description"
              rows={4}
              placeholder="Provide context, deliverables, milestones, or key goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-input textarea-input"
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-actions-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-modal-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Project'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
