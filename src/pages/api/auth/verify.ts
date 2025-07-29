import type { APIRoute } from 'astro';
import { AuthService } from '../../../modules/auth/auth.service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Token is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const result = await AuthService.verifyToken(token);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}; 