import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  User,
  Trash2,
  Edit,
  Archive,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Folder,
  Loader2,
} from 'lucide-react';
import { ProjectModal } from './ProjectModal';
import { TaskModal } from './TaskModal';
import { getProjects, deleteProject, archiveProject } from '../services/projectService';
import { getTasksByProject, deleteTask, updateTask } from '../services/taskService';
import type { ProjectResponse } from '../types/project';
import type { TaskResponse, TaskStatus, TaskPriority } from '../types/task';

interface Props {
  token: string;
}

export const ProjectsManager: React.FC<Props> = ({ token }) => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);

  // Loading states
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectResponse | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskResponse | null>(null);

  // Load Projects
  const loadProjects = async () => {
    setLoadingProjects(true);
    setActionError(null);
    try {
      const data = await getProjects(token);
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      } else if (data.length > 0 && selectedProjectId && !data.some((p) => p.id === selectedProjectId)) {
        setSelectedProjectId(data[0].id);
      } else if (data.length === 0) {
        setSelectedProjectId(null);
        setTasks([]);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [token]);

  // Load Tasks when selected project changes
  const loadTasks = async (projId: string) => {
    setLoadingTasks(true);
    setActionError(null);
    try {
      const data = await getTasksByProject(token, projId);
      setTasks(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load project tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    } else {
      setTasks([]);
    }
  }, [selectedProjectId, token]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Project Actions
  const handleProjectSaved = (saved: ProjectResponse) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? saved : p));
      }
      return [saved, ...prev];
    });
    setSelectedProjectId(saved.id);
  };

  const handleDeleteProject = async (id: string, name: string) => {
    setActionError(null);

    // Validate that project has no tasks before deletion
    let projectTasks = id === selectedProjectId && !loadingTasks ? tasks : null;
    if (!projectTasks) {
      try {
        projectTasks = await getTasksByProject(token, id);
      } catch (err: any) {
        setActionError(err.message || 'Failed to verify project tasks before deletion');
        return;
      }
    }

    if (projectTasks && projectTasks.length > 0) {
      setActionError(
        `Cannot delete project "${name}": It still contains ${projectTasks.length} task${
          projectTasks.length === 1 ? '' : 's'
        }. Please delete or remove all tasks before deleting this project.`
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to delete project "${name}"?`)) {
      return;
    }
    try {
      await deleteProject(token, id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProjectId === id) {
        const remaining = projects.filter((p) => p.id !== id);
        setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Could not delete project');
    }
  };

  const handleArchiveProject = async (id: string) => {
    try {
      const updated = await archiveProject(token, id);
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err: any) {
      setActionError(err.message || 'Failed to archive project');
    }
  };

  // Task Actions
  const handleTaskSaved = (saved: TaskResponse) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      if (exists) {
        return prev.map((t) => (t.id === saved.id ? saved : t));
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!selectedProjectId) return;
    if (!window.confirm(`Delete task "${title}"?`)) return;

    try {
      await deleteTask(token, selectedProjectId, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: any) {
      setActionError(err.message || 'Could not delete task');
    }
  };

  const handleQuickStatusChange = async (task: TaskResponse, newStatus: TaskStatus) => {
    if (!selectedProjectId || task.status === newStatus) return;

    try {
      const updated = await updateTask(token, selectedProjectId, task.id, {
        title: task.title,
        description: task.description || undefined,
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate || undefined,
        assigneeId: task.assignee?.id,
        tagIds: task.tags?.map((t) => t.id),
      });
      handleTaskSaved(updated);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update task status');
    }
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="projects-manager-layout">
      {/* Top Bar: Project Switcher & Project Create Button */}
      <div className="pm-top-bar">
        <div className="pm-project-selector-group">
          <label htmlFor="project-select" className="pm-label">
            <Folder size={16} />
            <span>Active Project:</span>
          </label>
          <div className="pm-select-wrapper">
            <select
              id="project-select"
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={projects.length === 0}
              className="pm-project-select"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.archived ? '(Archived)' : ''}
                </option>
              ))}
              {projects.length === 0 && <option value="">No projects available</option>}
            </select>
            <ChevronDown size={14} className="select-arrow-icon" />
          </div>
        </div>

        <div className="pm-top-actions">
          {selectedProject && (
            <div className="pm-project-control-btns">
              <button
                type="button"
                onClick={() => {
                  setProjectToEdit(selectedProject);
                  setIsProjectModalOpen(true);
                }}
                className="btn-pm-ghost"
                title="Edit Project Name or Description"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleArchiveProject(selectedProject.id)}
                className="btn-pm-ghost"
                title={selectedProject.archived ? 'Project Archived' : 'Archive Project'}
              >
                <Archive size={14} />
                <span>{selectedProject.archived ? 'Archived' : 'Archive'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProject(selectedProject.id, selectedProject.name)}
                className={`btn-pm-ghost danger ${tasks.length > 0 ? 'has-tasks' : ''}`}
                title={
                  tasks.length > 0
                    ? `Cannot delete: project has ${tasks.length} task${
                        tasks.length === 1 ? '' : 's'
                      }. Delete all tasks first.`
                    : 'Delete this project'
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setProjectToEdit(null);
              setIsProjectModalOpen(true);
            }}
            className="btn-pm-primary"
          >
            <FolderPlus size={16} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="pm-alert-banner">
          <AlertTriangle size={16} />
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} className="alert-dismiss">
            ×
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      {loadingProjects ? (
        <div className="pm-loading-state">
          <Loader2 size={32} className="spin-icon" />
          <p>Loading your workspace projects...</p>
        </div>
      ) : projects.length === 0 ? (
        /* Empty State: No Projects */
        <div className="pm-empty-workspace">
          <div className="empty-icon-circle">
            <Sparkles size={36} />
          </div>
          <h3>Welcome to Your Workspace!</h3>
          <p>
            You don't have any projects yet. Create your first project to start organizing,
            prioritizing, and tracking your team's tasks.
          </p>
          <button
            type="button"
            onClick={() => {
              setProjectToEdit(null);
              setIsProjectModalOpen(true);
            }}
            className="btn-pm-primary"
          >
            <FolderPlus size={16} />
            <span>Create Your First Project</span>
          </button>
        </div>
      ) : (
        /* Active Project & Tasks View */
        <div className="pm-content-body">
          {/* Project Header Info Card */}
          {selectedProject && (
            <div className="pm-project-header-card">
              <div className="project-info-col">
                <div className="project-title-row">
                  <h2 className="project-headline">{selectedProject.name}</h2>
                  {selectedProject.archived && <span className="archived-tag">Archived</span>}
                </div>
                {selectedProject.description && (
                  <p className="project-desc">{selectedProject.description}</p>
                )}
              </div>

              {/* Progress Summary */}
              <div className="project-progress-col">
                <div className="progress-labels">
                  <span>Task Completion</span>
                  <strong>
                    {completedCount} of {tasks.length} ({progressPercent}%)
                  </strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tasks ToolBar: Search, Filters, New Task Button */}
          <div className="pm-tasks-toolbar">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search tasks by title or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-controls">
              <div className="priority-select-box">
                <Filter size={14} className="filter-icon" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="priority-select"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="btn-pm-primary"
              >
                <Plus size={16} />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="status-tabs-row">
            {[
              { id: 'ALL', label: 'All Tasks', count: tasks.length },
              { id: 'TODO', label: 'To Do', count: tasks.filter((t) => t.status === 'TODO').length },
              { id: 'IN_PROGRESS', label: 'In Progress', count: tasks.filter((t) => t.status === 'IN_PROGRESS').length },
              { id: 'IN_REVIEW', label: 'In Review', count: tasks.filter((t) => t.status === 'IN_REVIEW').length },
              { id: 'DONE', label: 'Done', count: tasks.filter((t) => t.status === 'DONE').length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`status-tab-chip ${statusFilter === tab.id ? 'active' : ''}`}
              >
                <span>{tab.label}</span>
                <span className="tab-count">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Tasks List / Cards */}
          {loadingTasks ? (
            <div className="pm-loading-state small">
              <Loader2 size={24} className="spin-icon" />
              <span>Loading tasks...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="pm-empty-tasks">
              <p>
                {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? 'No tasks match the active search or filters.'
                  : 'No tasks in this project yet.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="btn-add-first-task"
              >
                <Plus size={14} />
                <span>Add a Task</span>
              </button>
            </div>
          ) : (
            <div className="tasks-grid">
              {filteredTasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-card-header">
                    <div className="task-badges-row">
                      {/* Priority Badge */}
                      <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority === 'URGENT' && <AlertTriangle size={12} />}
                        {task.priority}
                      </span>

                      {/* Status Dropdown Pill */}
                      <div className="status-quick-picker">
                        <select
                          value={task.status}
                          onChange={(e) => handleQuickStatusChange(task, e.target.value as TaskStatus)}
                          className={`status-select-pill status-${task.status.toLowerCase().replace('_', '-')}`}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="DONE">Done</option>
                        </select>
                      </div>
                    </div>

                    <div className="task-card-menu">
                      <button
                        type="button"
                        onClick={() => {
                          setTaskToEdit(task);
                          setIsTaskModalOpen(true);
                        }}
                        className="btn-card-action"
                        title="Edit Task"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="btn-card-action danger"
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 className="task-title">{task.title}</h4>

                  {task.description && (
                    <p className="task-description-preview">{task.description}</p>
                  )}

                  {/* Task Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="task-tags-row">
                      {task.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="task-tag-badge"
                          style={{
                            color: tag.colorHex,
                            borderColor: tag.colorHex,
                            backgroundColor: `${tag.colorHex}18`,
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Task Footer: Due Date & Assignee */}
                  <div className="task-card-footer">
                    {task.dueDate ? (
                      <span className="task-date-badge">
                        <Calendar size={12} />
                        <span>{task.dueDate}</span>
                      </span>
                    ) : (
                      <span className="task-date-badge muted">
                        <Clock size={12} />
                        <span>No due date</span>
                      </span>
                    )}

                    {task.assignee ? (
                      <span className="task-assignee-badge" title={`Assigned to ${task.assignee.fullName}`}>
                        <div className="assignee-avatar-sm">
                          {task.assignee.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="assignee-name">{task.assignee.fullName}</span>
                      </span>
                    ) : (
                      <span className="task-assignee-badge unassigned">
                        <User size={12} />
                        <span>Unassigned</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        token={token}
        projectToEdit={projectToEdit}
        onProjectSaved={handleProjectSaved}
      />

      {/* Task Modal */}
      {selectedProjectId && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          token={token}
          projectId={selectedProjectId}
          taskToEdit={taskToEdit}
          onTaskSaved={handleTaskSaved}
        />
      )}
    </div>
  );
};
