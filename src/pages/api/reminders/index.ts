import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

// Helper function to get user from request
function getUserFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  let token = null;
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    token = cookies['auth_token'];
  }
  
  if (!token) {
    const authorization = request.headers.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
      token = authorization.slice(7);
    }
  }
  
  return token ? verifyToken(token) : null;
}

// GET /api/reminders - List all reminders for authenticated user
export const GET: APIRoute = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const reminders = await prisma.reminder.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    return new Response(JSON.stringify({
      success: true,
      reminders
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch reminders'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/reminders - Create new reminder
export const POST: APIRoute = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.text || !data.date) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Text and date are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const reminder = await prisma.reminder.create({
      data: {
        text: data.text,
        date: new Date(data.date),
        isNear: data.isNear || false,
        alertEnabled: data.alertEnabled !== undefined ? data.alertEnabled : true,
        alertMinutes: data.alertMinutes || 60,
        completed: data.completed || false,
        userId: user.id
      }
    });

    return new Response(JSON.stringify({
      success: true,
      reminder
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create reminder'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 