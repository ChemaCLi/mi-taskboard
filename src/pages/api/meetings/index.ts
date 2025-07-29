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

// GET /api/meetings - List all meetings for authenticated user
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
    
    const meetings = await prisma.meeting.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        datetime: 'asc'
      }
    });

    return new Response(JSON.stringify({
      success: true,
      meetings
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch meetings'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/meetings - Create new meeting
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
    if (!data.title || !data.datetime) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Title and datetime are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title: data.title,
        description: data.description || null,
        datetime: new Date(data.datetime),
        duration: data.duration || null,
        alertEnabled: data.alertEnabled !== undefined ? data.alertEnabled : true,
        alertMinutes: data.alertMinutes || 5,
        completed: data.completed || false,
        userId: user.id
      }
    });

    return new Response(JSON.stringify({
      success: true,
      meeting
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create meeting'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 