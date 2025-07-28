import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
}

export function generateToken(user: User): string {
  const payload: UserPayload = {
    id: user.id,
    username: user.username,
    email: user.email
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getUserFromRequest(request: Request): UserPayload | null {
  const authorization = request.headers.get('authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authorization.slice(7); // Remove 'Bearer ' prefix
  return verifyToken(token);
} 