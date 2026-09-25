import type { AuthResponse, RegisterRequest } from '../types/auth';

export class AuthApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const getApiBaseUrl = (): string => {
  const customUrl = localStorage.getItem('taskmanager_api_url');
  if (customUrl) return customUrl.replace(/\/+$/, '');
  
  // If running in development with Vite proxy or production same origin
  return '';
};

export const setApiBaseUrl = (url: string): void => {
  if (!url || url.trim() === '') {
    localStorage.removeItem('taskmanager_api_url');
  } else {
    localStorage.setItem('taskmanager_api_url', url.trim().replace(/\/+$/, ''));
  }
};

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/v1/auth/register`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status === 201 || response.ok) {
      return (await response.json()) as AuthResponse;
    }

    if (response.status === 409) {
      throw new AuthApiError('This email is already in use. Please sign in or use another email.', 409);
    }

    if (response.status === 422) {
      const errorMap: Record<string, string> = await response.json().catch(() => ({}));
      const firstErrorMessage = Object.values(errorMap)[0] || 'Validation failed for submitted data.';
      throw new AuthApiError(firstErrorMessage, 422, errorMap);
    }

    if (response.status === 429) {
      throw new AuthApiError('Too many registration attempts. Please wait a minute and try again.', 429);
    }

    const errBody = await response.json().catch(() => ({}));
    const message = errBody.message || `Registration failed (Status code: ${response.status})`;
    throw new AuthApiError(message, response.status);
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }
    const errorMsg = error instanceof Error ? error.message : 'Unknown network error';
    throw new AuthApiError(
      `Unable to connect to the backend service (${errorMsg}). Ensure the API server is running on ${baseUrl || 'http://localhost:8080'}.`,
      0
    );
  }
};
