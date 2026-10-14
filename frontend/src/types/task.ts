import type { UserResponse } from './auth';
import type { TagResponse } from './tag';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  position?: number;
  idempotencyKey?: string;
  tagIds?: string[];
}

export interface TaskResponse {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  assignee?: UserResponse | null;
  createdBy: UserResponse;
  tags?: TagResponse[];
}
