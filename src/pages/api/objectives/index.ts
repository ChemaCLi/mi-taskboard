import { withAuth } from '../../../lib/middleware';
import { prisma } from '../../../lib/prisma';

// GET /api/objectives - List all objectives for authenticated user
export const GET = withAuth(async ({ request }) => {
  try {
    const { user } = request;
    
    const objectives = await prisma.objective.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new Response(JSON.stringify({
      success: true,
      objectives
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Get objectives error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch objectives'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

// POST /api/objectives - Create new objective
export const POST = withAuth(async ({ request }) => {
  try {
    const { user } = request;
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.deadline) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Title and deadline are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const objective = await prisma.objective.create({
      data: {
        title: data.title,
        description: data.description || null,
        deadline: new Date(data.deadline),
        status: data.status || 'ACTIVE',
        priority: data.priority || 'MEDIUM',
        details: data.details || null,
        peopleHelp: data.peopleHelp || [],
        timeNeeded: data.timeNeeded || null,
        purpose: data.purpose || null,
        existing: data.existing || null,
        complexities: data.complexities || null,
        resources: data.resources || null,
        userId: user.id
      }
    });

    return new Response(JSON.stringify({
      success: true,
      objective
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Create objective error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create objective'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}); 