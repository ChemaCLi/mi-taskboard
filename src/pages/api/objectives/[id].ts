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

// GET /api/objectives/[id] - Get specific objective
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
        error: 'Objective ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const objective = await prisma.objective.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        tasks: true
      }
    });

    if (!objective) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Objective not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      objective
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get objective error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch objective'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/objectives/[id] - Update objective
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
        error: 'Objective ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if objective exists and belongs to user
    const existingObjective = await prisma.objective.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingObjective) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Objective not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build update object
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    if (data.details !== undefined) updateData.details = data.details;
    if (data.peopleHelp !== undefined) updateData.peopleHelp = data.peopleHelp;
    if (data.timeNeeded !== undefined) updateData.timeNeeded = data.timeNeeded;
    if (data.purpose !== undefined) updateData.purpose = data.purpose;
    if (data.existing !== undefined) updateData.existing = data.existing;
    if (data.complexities !== undefined) updateData.complexities = data.complexities;
    if (data.resources !== undefined) updateData.resources = data.resources;

    const objective = await prisma.objective.update({
      where: { id },
      data: updateData,
      include: {
        tasks: true
      }
    });

    return new Response(JSON.stringify({
      success: true,
      objective
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update objective error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update objective'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE /api/objectives/[id] - Delete objective
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
        error: 'Objective ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if objective exists and belongs to user
    const existingObjective = await prisma.objective.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingObjective) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Objective not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await prisma.objective.delete({
      where: { id }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Objective deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete objective error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete objective'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 