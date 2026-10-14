import { getApiBaseUrl, AuthApiError } from './authService';
import type { TagRequest, TagResponse } from '../types/tag';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const getTagsByProject = async (token: string, projectId: string): Promise<TagResponse[]> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects/${projectId}/tags`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new AuthApiError('Failed to fetch tags', response.status);
  }

  return response.json();
};

export const createTag = async (
  token: string,
  projectId: string,
  data: TagRequest
): Promise<TagResponse> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects/${projectId}/tags`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (response.status === 201 || response.ok) {
    return response.json();
  }

  if (response.status === 409) {
    throw new AuthApiError(`Tag '${data.name}' already exists in this project.`, 409);
  }

  const errBody = await response.json().catch(() => ({}));
  throw new AuthApiError(errBody.message || 'Failed to create tag', response.status);
};

export const deleteTag = async (token: string, projectId: string, tagId: string): Promise<void> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/projects/${projectId}/tags/${tagId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

  if (!response.ok && response.status !== 204) {
    throw new AuthApiError('Failed to delete tag', response.status);
  }
};
