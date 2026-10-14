import type { UserResponse } from './auth';

export interface ProjectRequest {
  name: string;
  description?: string;
  idempotencyKey?: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  owner: UserResponse;
}
