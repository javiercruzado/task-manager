import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  Edit3,
  Calendar,
  User,
  Tag as TagIcon,
  Plus,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { createTask, updateTask } from '../services/taskService';
import { getTagsByProject, createTag } from '../services/tagService';
import { getAllUsers } from '../services/userService';
import type { TaskRequest, TaskResponse, TaskStatus, TaskPriority } from '../types/task';
import type { TagResponse } from '../types/tag';
import type { UserResponse } from '../types/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  projectId: string;
  taskToEdit?: TaskResponse | null;
  onTaskSaved: (task: TaskResponse) => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; icon: React.ReactNode; colorClass: string }[] = [
  { value: 'TODO', label: 'To Do', icon: <Clock size={14} />, colorClass: 'status-todo' },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: <Loader2 size={14} />, colorClass: 'status-progress' },
  { value: 'IN_REVIEW', label: 'In Review', icon: <CheckSquare size={14} />, colorClass: 'status-review' },
  { value: 'DONE', label: 'Done', icon: <CheckCircle2 size={14} />, colorClass: 'status-done' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; icon: React.ReactNode; colorClass: string }[] = [
  { value: 'LOW', label: 'Low', icon: null, colorClass: 'priority-low' },
  { value: 'MEDIUM', label: 'Medium', icon: null, colorClass: 'priority-medium' },
  { value: 'HIGH', label: 'High', icon: null, colorClass: 'priority-high' },
  { value: 'URGENT', label: 'Urgent', icon: <AlertTriangle size={14} />, colorClass: 'priority-urgent' },
];

export const TaskModal: React.FC<Props> = ({
  isOpen,
  onClose,
  token,
  projectId,
  taskToEdit,
  onTaskSaved,
}) => {
  const isEditing = Boolean(taskToEdit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Metadata from API
  const [availableTags, setAvailableTags] = useState<TagResponse[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserResponse[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366F1');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const [titleError, setTitleError] = useState('');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate || '');
      setAssigneeId(taskToEdit.assignee ? taskToEdit.assignee.id : '');
      setSelectedTagIds(taskToEdit.tags ? taskToEdit.tags.map((t) => t.id) : []);
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setDueDate('');
      setAssigneeId('');
      setSelectedTagIds([]);
    }

    setTitleError('');
    setGeneralError(null);
    setIsAddingTag(false);

    // Load project tags and workspace users
    getTagsByProject(token, projectId)
      .then(setAvailableTags)
      .catch((e) => console.warn('Could not load tags', e));

    getAllUsers(token)
      .then(setAvailableUsers)
      .catch((e) => console.warn('Could not load users', e));
  }, [isOpen, taskToEdit, projectId, token]);

  if (!isOpen) return null;

  const validate = () => {
    if (!title.trim()) {
      setTitleError('Task title is required');
      return false;
    }
    if (title.trim().length > 255) {
      setTitleError('Task title cannot exceed 255 characters');
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateNewTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const created = await createTag(token, projectId, {
        name: newTagName.trim(),
        colorHex: newTagColor,
      });
      setAvailableTags((prev) => [...prev, created]);
      setSelectedTagIds((prev) => [...prev, created.id]);
      setNewTagName('');
      setIsAddingTag(false);
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to create new tag');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    const payload: TaskRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate || undefined,
      assigneeId: assigneeId || undefined,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    };

    try {
      let savedTask: TaskResponse;
      if (isEditing && taskToEdit) {
        savedTask = await updateTask(token, projectId, taskToEdit.id, payload);
      } else {
        savedTask = await createTask(token, projectId, payload);
      }
      onTaskSaved(savedTask);
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-dialog-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              {isEditing ? <Edit3 size={20} /> : <CheckSquare size={20} />}
            </div>
            <div>
              <h3 className="modal-title">{isEditing ? 'Edit Task' : 'Create New Task'}</h3>
              <p className="modal-subtitle">
                {isEditing ? 'Update task requirements, priority or assignees' : 'Add an actionable task item to this project'}
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
          {/* Title Field */}
          <div className="form-field-group">
            <div className="field-label-row">
              <label htmlFor="task-title" className="field-label">
                Task Title <span className="required-star">*</span>
              </label>
              <span className={`char-counter ${title.length > 230 ? 'warning' : ''}`}>
                {title.length}/255
              </span>
            </div>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Design responsive navigation drawer"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError('');
                if (generalError) setGeneralError(null);
              }}
              onBlur={validate}
              maxLength={255}
              className={`text-input ${titleError ? 'has-error' : ''}`}
              autoFocus
              disabled={isSubmitting}
            />
            {titleError && <span className="field-error-text">{titleError}</span>}
          </div>

          {/* Description Field */}
          <div className="form-field-group">
            <label htmlFor="task-description" className="field-label">
              Description <span className="optional-tag">(Optional)</span>
            </label>
            <textarea
              id="task-description"
              rows={3}
              placeholder="Add acceptance criteria, technical notes, or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-input textarea-input"
              disabled={isSubmitting}
            />
          </div>

          {/* Status & Priority Dual Row */}
          <div className="modal-grid-2">
            {/* Status Selection */}
            <div className="form-field-group">
              <label className="field-label">Status</label>
              <div className="selector-pills-row">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`selector-pill ${opt.colorClass} ${status === opt.value ? 'selected' : ''}`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Selection */}
            <div className="form-field-group">
              <label className="field-label">Priority</label>
              <div className="selector-pills-row">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`selector-pill ${opt.colorClass} ${priority === opt.value ? 'selected' : ''}`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date & Assignee Dual Row */}
          <div className="modal-grid-2">
            {/* Due Date */}
            <div className="form-field-group">
              <label htmlFor="task-due-date" className="field-label">
                <Calendar size={14} className="label-icon" />
                <span>Due Date</span>
              </label>
              <div className="input-with-presets">
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-input"
                  disabled={isSubmitting}
                />
                <div className="date-presets-row">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setDueDate(today);
                    }}
                    className="preset-btn"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setDueDate(d.toISOString().split('T')[0]);
                    }}
                    className="preset-btn"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setDueDate(d.toISOString().split('T')[0]);
                    }}
                    className="preset-btn"
                  >
                    Next Week
                  </button>
                  {dueDate && (
                    <button type="button" onClick={() => setDueDate('')} className="preset-btn clear">
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Assignee */}
            <div className="form-field-group">
              <label htmlFor="task-assignee" className="field-label">
                <User size={14} className="label-icon" />
                <span>Assignee</span>
              </label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="text-input select-input"
                disabled={isSubmitting}
              >
                <option value="">Unassigned</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Section */}
          <div className="form-field-group">
            <div className="field-label-row">
              <label className="field-label">
                <TagIcon size={14} className="label-icon" />
                <span>Tags</span>
              </label>
              {!isAddingTag && (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="add-tag-toggle-btn"
                >
                  <Plus size={12} />
                  <span>New Tag</span>
                </button>
              )}
            </div>

            {/* Existing Tags Chips */}
            <div className="tags-selection-cloud">
              {availableTags.length === 0 && !isAddingTag && (
                <span className="no-tags-tip">No tags created for this project yet.</span>
              )}
              {availableTags.map((t) => {
                const isSelected = selectedTagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleToggleTag(t.id)}
                    className={`tag-selectable-chip ${isSelected ? 'selected' : ''}`}
                    style={{
                      borderColor: t.colorHex,
                      backgroundColor: isSelected ? `${t.colorHex}22` : undefined,
                      color: isSelected ? t.colorHex : undefined,
                    }}
                  >
                    <span className="tag-dot" style={{ backgroundColor: t.colorHex }} />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Inline Mini Tag Creator */}
            {isAddingTag && (
              <div className="inline-tag-creator">
                <input
                  type="text"
                  placeholder="Tag name (e.g. Frontend)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="text-input mini-input"
                  maxLength={50}
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="color-picker-input"
                  title="Pick tag color"
                />
                <button
                  type="button"
                  onClick={handleCreateNewTag}
                  className="btn-mini-save"
                >
                  Add Tag
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTag(false)}
                  className="btn-mini-cancel"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
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
                <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
