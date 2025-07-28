import { prisma } from '../../lib/prisma';
import { hashPassword, comparePassword, generateToken } from '../../lib/auth';
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

export class AuthService {
  /**
   * Register a new user - only allows one user in the system
   */
  static async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Check if any user already exists (single-user system)
      const existingUser = await prisma.user.findFirst();
      
      if (existingUser) {
        return {
          success: false,
          error: 'Registration is not allowed. User already exists in the system.'
        };
      }

      // Check if username is already taken (redundant but good for future)
      const existingUsername = await prisma.user.findUnique({
        where: { username: data.username }
      });

      if (existingUsername) {
        return {
          success: false,
          error: 'Username already exists'
        };
      }

      // Check if email is already taken
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingEmail) {
        return {
          success: false,
          error: 'Email already exists'
        };
      }

      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash
        }
      });

      // Generate token
      const token = generateToken(user);

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Failed to register user'
      };
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<AuthResult> {
    try {
      // Find user by username
      const user = await prisma.user.findUnique({
        where: { username: data.username }
      });

      if (!user) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      // Check password
      const isValidPassword = await comparePassword(data.password, user.passwordHash);

      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      // Generate token
      const token = generateToken(user);

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Failed to login'
      };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return null;
      }

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;

    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Check if any user exists in the system
   */
  static async hasAnyUser(): Promise<boolean> {
    try {
      const userCount = await prisma.user.count();
      return userCount > 0;
    } catch (error) {
      console.error('Check user existence error:', error);
      return false;
    }
  }
} 