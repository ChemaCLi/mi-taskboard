import type { APIRoute } from 'astro';
import { AuthService } from '../../../modules/auth/auth.service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const result = await AuthService.login(data);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}; 