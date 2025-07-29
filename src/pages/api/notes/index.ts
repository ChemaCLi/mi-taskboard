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

// GET /api/notes - List all notes for authenticated user
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
    
    const notes = await prisma.note.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return new Response(JSON.stringify({
      success: true,
      notes
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch notes'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/notes - Create new note
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
    if (!data.content) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const note = await prisma.note.create({
      data: {
        title: data.title || null,
        content: data.content,
        project: data.project || null,
        tags: data.tags || [],
        isNotebook: data.isNotebook || false,
        notebookDate: data.notebookDate ? new Date(data.notebookDate) : null,
        userId: user.id
      }
    });

    return new Response(JSON.stringify({
      success: true,
      note
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create note error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create note'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 