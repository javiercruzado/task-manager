import { getApiBaseUrl, AuthApiError } from './authService';
import type { UserResponse } from '../types/auth';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const getAllUsers = async (token: string): Promise<UserResponse[]> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/users`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new AuthApiError('Failed to fetch workspace users', response.status);
  }

  return response.json();
};
