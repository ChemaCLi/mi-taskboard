import { withAuth } from '../../../lib/middleware';
import { prisma } from '../../../lib/prisma';

export const GET = withAuth(async ({ request }) => {
  try {
    const { user } = request;
    
    // Get user profile with statistics
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            tasks: true,
            objectives: true,
            notes: true,
            meetings: true,
            workSessions: true
          }
        }
      }
    });

    if (!userProfile) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user: userProfile
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch user profile'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}); 