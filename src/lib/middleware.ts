import type { APIRoute } from 'astro';
import { verifyToken } from './auth';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    username: string;
    email: string;
  };
}

function getTokenFromRequest(request: Request): string | null {
  // First, try Authorization header
  const authorization = request.headers.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.slice(7); // Remove 'Bearer ' prefix
  }
  
  // Then, try cookies
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    return cookies['auth_token'] || null;
  }
  
  return null;
}

export function withAuth(handler: (context: { request: AuthenticatedRequest }) => Response | Promise<Response>): APIRoute {
  return async ({ request }) => {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication required'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const user = verifyToken(token);
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired token'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;

    try {
      return await handler({ request: authenticatedRequest });
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  };
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
} 