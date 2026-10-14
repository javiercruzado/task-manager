import { getApiBaseUrl, AuthApiError } from './authService';
import type { ProjectRequest, ProjectResponse } from '../types/project';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const getProjects = async (token: string): Promise<ProjectResponse[]> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new AuthApiError('Failed to fetch projects', response.status);
  }

  return response.json();
};

export const getProjectById = async (token: string, id: string): Promise<ProjectResponse> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects/${id}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new AuthApiError('Failed to fetch project details', response.status);
  }

  return response.json();
};

export const createProject = async (token: string, data: ProjectRequest): Promise<ProjectResponse> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (response.status === 201 || response.ok) {
    return response.json();
  }

  if (response.status === 409) {
    throw new AuthApiError('A project with this name already exists in your workspace.', 409);
  }

  if (response.status === 422) {
    const errorMap = await response.json().catch(() => ({}));
    const firstMsg = Object.values(errorMap)[0] || 'Invalid project information.';
    throw new AuthApiError(String(firstMsg), 422, errorMap);
  }

  const errBody = await response.json().catch(() => ({}));
  throw new AuthApiError(errBody.message || 'Failed to create project', response.status);
};

export const updateProject = async (token: string, id: string, data: ProjectRequest): Promise<ProjectResponse> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (response.ok) {
    return response.json();
  }

  if (response.status === 409) {
    throw new AuthApiError('A project with this name already exists.', 409);
  }

  const errBody = await response.json().catch(() => ({}));
  throw new AuthApiError(errBody.message || 'Failed to update project', response.status);
};

export const archiveProject = async (token: string, id: string): Promise<ProjectResponse> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects/${id}/archive`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new AuthApiError('Failed to archive project', response.status);
  }

  return response.json();
};

export const deleteProject = async (token: string, id: string): Promise<void> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

  if (!response.ok && response.status !== 204) {
    throw new AuthApiError('Failed to delete project', response.status);
  }
};
