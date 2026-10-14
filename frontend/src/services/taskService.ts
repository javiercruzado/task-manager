import { getApiBaseUrl, AuthApiError } from './authService';
import type { TaskRequest, TaskResponse } from '../types/task';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const getTasksByProject = async (token: string, projectId: string): Promise<TaskResponse[]> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects/${projectId}/tasks`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new AuthApiError('Failed to load project tasks', response.status);
  }

  return response.json();
};

export const createTask = async (
  token: string,
  projectId: string,
  data: TaskRequest
): Promise<TaskResponse> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (response.status === 201 || response.ok) {
    return response.json();
  }

  if (response.status === 422) {
    const errorMap = await response.json().catch(() => ({}));
    const firstMsg = Object.values(errorMap)[0] || 'Invalid task input.';
    throw new AuthApiError(String(firstMsg), 422, errorMap);
  }

  const errBody = await response.json().catch(() => ({}));
  throw new AuthApiError(errBody.message || 'Failed to create task', response.status);
};

export const updateTask = async (
  token: string,
  projectId: string,
  taskId: string,
  data: TaskRequest
): Promise<TaskResponse> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects/${projectId}/tasks/${taskId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (response.ok) {
    return response.json();
  }

  if (response.status === 422) {
    const errorMap = await response.json().catch(() => ({}));
    const firstMsg = Object.values(errorMap)[0] || 'Invalid task update values.';
    throw new AuthApiError(String(firstMsg), 422, errorMap);
  }

  const errBody = await response.json().catch(() => ({}));
  throw new AuthApiError(errBody.message || 'Failed to update task', response.status);
};

export const deleteTask = async (
  token: string,
  projectId: string,
  taskId: string
): Promise<void> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects/${projectId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

  if (!response.ok && response.status !== 204) {
    throw new AuthApiError('Failed to delete task', response.status);
  }
};
