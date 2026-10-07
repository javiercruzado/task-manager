export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp?: string;
  fieldErrors?: Record<string, string>;
}
