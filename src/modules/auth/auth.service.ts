import { prisma } from '../../lib/prisma';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../../lib/auth';
import type { User } from '@prisma/client';
import type { RegisterData, LoginData, AuthResult } from './auth.types';

export class AuthService {
  /**
   * Register a new user - supports multi-user system
   */
  static async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Check if username is already taken
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

      // Create user with default settings
      const user = await prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash,
          settings: {
            create: {
              startHour: 9,
              endHour: 18,
              lunchStart: 13,
              lunchEnd: 14,
              workDuration: 25,
              shortBreak: 5,
              longBreak: 15,
              meetingAlert: 5
            }
          }
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

  /**
   * Verify token and return user data
   */
  static async verifyToken(token: string): Promise<AuthResult> {
    try {
      const payload = verifyToken(token);
      
      if (!payload) {
        return {
          success: false,
          error: 'Invalid token'
        };
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.id }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword
      };

    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        error: 'Failed to verify token'
      };
    }
  }
} 