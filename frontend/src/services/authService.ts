import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types/auth';

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
  // 1. Manual override from settings drawer in localStorage
  const customUrl = localStorage.getItem('taskmanager_api_url');
  if (customUrl) return customUrl.replace(/\/+$/, '');
  
  // 2. Build-time or deployment environment variable (Vercel, Cloudflare Pages, Netlify)
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 3. In development with Vite proxy or production same-origin
  return '';
};

export const setApiBaseUrl = (url: string): void => {
  if (!url || url.trim() === '') {
    localStorage.removeItem('taskmanager_api_url');
  } else {
    localStorage.setItem('taskmanager_api_url', url.trim().replace(/\/+$/, ''));
  }
};

export const saveTokens = (tokens: AuthResponse): void => {
  if (tokens.accessToken) {
    localStorage.setItem('taskmanager_access_token', tokens.accessToken);
  }
  if (tokens.refreshToken) {
    localStorage.setItem('taskmanager_refresh_token', tokens.refreshToken);
  }
};

export const getTokens = (): AuthResponse => {
  return {
    accessToken: localStorage.getItem('taskmanager_access_token'),
    refreshToken: localStorage.getItem('taskmanager_refresh_token'),
  };
};

export const clearTokens = (): void => {
  localStorage.removeItem('taskmanager_access_token');
  localStorage.removeItem('taskmanager_refresh_token');
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

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/v1/auth/login`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const tokens = (await response.json()) as AuthResponse;
      saveTokens(tokens);
      return tokens;
    }

    if (response.status === 401) {
      throw new AuthApiError(
        'Invalid email or password, or your account has not been activated via the verification email yet.',
        401
      );
    }

    if (response.status === 422) {
      const errorMap: Record<string, string> = await response.json().catch(() => ({}));
      const firstErrorMessage = Object.values(errorMap)[0] || 'Please provide valid credentials.';
      throw new AuthApiError(firstErrorMessage, 422, errorMap);
    }

    if (response.status === 429) {
      throw new AuthApiError('Too many login attempts. Please wait a minute and try again.', 429);
    }

    const errBody = await response.json().catch(() => ({}));
    const message = errBody.message || `Login failed (Status code: ${response.status})`;
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

export const getCurrentUser = async (accessToken: string): Promise<UserResponse> => {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/v1/users/me`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      return (await response.json()) as UserResponse;
    }

    if (response.status === 401) {
      clearTokens();
      throw new AuthApiError('Your session has expired. Please sign in again.', 401);
    }

    throw new AuthApiError('Failed to fetch user profile', response.status);
  } catch (error) {
    if (error instanceof AuthApiError) throw error;
    throw new AuthApiError('Unable to retrieve user details from server.', 0);
  }
};

export const logoutUser = async (refreshToken?: string | null): Promise<void> => {
  const baseUrl = getApiBaseUrl();
  const token = refreshToken || getTokens().refreshToken;

  if (token) {
    try {
      await fetch(`${baseUrl}/api/v1/auth/logout?refreshToken=${encodeURIComponent(token)}`, {
        method: 'POST',
      });
    } catch (e) {
      console.warn('Backend logout call failed or was unreachable', e);
    }
  }

  clearTokens();
};
