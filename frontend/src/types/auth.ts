export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp?: string;
  fieldErrors?: Record<string, string>;
}
