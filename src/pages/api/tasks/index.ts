import { withAuth } from '../../../lib/middleware';
import { prisma } from '../../../lib/prisma';

export const GET = withAuth(async ({ request }) => {
  try {
    const { user } = request;
    
    // Get all tasks for the authenticated user
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new Response(JSON.stringify({
      success: true,
      tasks
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch tasks'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

export const POST = withAuth(async ({ request }) => {
  try {
    const { user } = request;
    const data = await request.json();
    
    // Create a new task for the authenticated user
    const task = await prisma.task.create({
      data: {
        ...data,
        userId: user.id
      }
    });

    return new Response(JSON.stringify({
      success: true,
      task
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Create task error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create task'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}); 