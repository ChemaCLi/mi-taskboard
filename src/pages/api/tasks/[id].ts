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

// GET /api/tasks/[id] - Get specific task
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
        error: 'Task ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!task) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Task not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      task
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get task error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch task'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/tasks/[id] - Update task
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
        error: 'Task ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingTask) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Task not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build update object
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.limitDate !== undefined) updateData.limitDate = data.limitDate ? new Date(data.limitDate) : null;
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    if (data.details !== undefined) updateData.details = data.details;
    if (data.peopleHelp !== undefined) updateData.peopleHelp = data.peopleHelp;
    if (data.timeNeeded !== undefined) updateData.timeNeeded = data.timeNeeded;
    if (data.purpose !== undefined) updateData.purpose = data.purpose;
    if (data.existing !== undefined) updateData.existing = data.existing;
    if (data.complexities !== undefined) updateData.complexities = data.complexities;
    if (data.resources !== undefined) updateData.resources = data.resources;
    if (data.objectiveId !== undefined) updateData.objectiveId = data.objectiveId;

    const task = await prisma.task.update({
      where: { id },
      data: updateData
    });

    return new Response(JSON.stringify({
      success: true,
      task
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update task error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update task'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE /api/tasks/[id] - Delete task
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
        error: 'Task ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingTask) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Task not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await prisma.task.delete({
      where: { id }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Task deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete task'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 