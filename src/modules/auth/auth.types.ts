import type { User } from '@prisma/client';

export interface RegisterData {
  username: string;
  password: string;
  email: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: Omit<User, 'passwordHash'>;
  token?: string;
  error?: string;
}

export interface AuthUser extends Omit<User, 'passwordHash'> {}

export interface UserPayload {
  id: string;
  username: string;
  email: string;
}

export interface ProtectedAPIContext {
  request: Request & {
    user: UserPayload;
  };
} 