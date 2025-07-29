import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

// Helper function to get user from request
function getUserFromRequest(request: Request) {
  // First try cookies
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
  
  // Then try Authorization header
  if (!token) {
    const authorization = request.headers.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
      token = authorization.slice(7);
    }
  }
  
  return token ? verifyToken(token) : null;
}

// GET /api/reminders/[id] - Get specific reminder
export const GET: APIRoute = async ({ request, params }) => {
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

    const id = params?.id as string;
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Reminder ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const reminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!reminder) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Reminder not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      reminder
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get reminder error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch reminder'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/reminders/[id] - Update reminder
export const PUT: APIRoute = async ({ request, params }) => {
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

    const id = params?.id as string;
    const data = await request.json();

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Reminder ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingReminder) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Reminder not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build update object
    const updateData: any = {};
    if (data.text !== undefined) updateData.text = data.text;
    if (data.date !== undefined) updateData.date = data.date ? new Date(data.date) : null;
    if (data.isNear !== undefined) updateData.isNear = data.isNear;
    if (data.alertEnabled !== undefined) updateData.alertEnabled = data.alertEnabled;
    if (data.alertMinutes !== undefined) updateData.alertMinutes = data.alertMinutes;
    if (data.completed !== undefined) updateData.completed = data.completed;

    const reminder = await prisma.reminder.update({
      where: { id },
      data: updateData
    });

    return new Response(JSON.stringify({
      success: true,
      reminder
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update reminder'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE /api/reminders/[id] - Delete reminder
export const DELETE: APIRoute = async ({ request, params }) => {
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

    const id = params?.id as string;
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Reminder ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingReminder) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Reminder not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await prisma.reminder.delete({
      where: { id }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Reminder deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete reminder'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 