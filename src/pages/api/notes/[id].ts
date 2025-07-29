import type { APIRoute } from 'astro';
import { withAuth } from '../../../lib/middleware';
import { prisma } from '../../../lib/prisma';

export const GET: APIRoute = async (context) => {
  const authHandler = withAuth(async ({ request }) => {
    try {
      const noteId = context.params?.id;
      if (!noteId) {
        return new Response(JSON.stringify({ success: false, error: 'Note ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId: (request as any).user.id
        }
      });

      if (!note) {
        return new Response(JSON.stringify({ success: false, error: 'Note not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, note }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching note:', error);
      return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  return authHandler(context);
};

export const PUT: APIRoute = async (context) => {
  const authHandler = withAuth(async ({ request }) => {
    try {
      const noteId = context.params?.id;
      if (!noteId) {
        return new Response(JSON.stringify({ success: false, error: 'Note ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const data = await request.json();
      const { title, content, project, tags, isNotebook, notebookDate } = data;

      // Verify the note belongs to the user
      const existingNote = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId: (request as any).user.id
        }
      });

      if (!existingNote) {
        return new Response(JSON.stringify({ success: false, error: 'Note not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Build update data object conditionally
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (project !== undefined) updateData.project = project;
      if (tags !== undefined) updateData.tags = tags;
      if (isNotebook !== undefined) updateData.isNotebook = isNotebook;
      if (notebookDate !== undefined) updateData.notebookDate = notebookDate ? new Date(notebookDate) : null;

      const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: updateData
      });

      return new Response(JSON.stringify({ success: true, note: updatedNote }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error updating note:', error);
      return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  return authHandler(context);
};

export const DELETE: APIRoute = async (context) => {
  const authHandler = withAuth(async ({ request }) => {
    try {
      const noteId = context.params?.id;
      if (!noteId) {
        return new Response(JSON.stringify({ success: false, error: 'Note ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Verify the note belongs to the user before deleting
      const existingNote = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId: (request as any).user.id
        }
      });

      if (!existingNote) {
        return new Response(JSON.stringify({ success: false, error: 'Note not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await prisma.note.delete({
        where: { id: noteId }
      });

      return new Response(JSON.stringify({ success: true, message: 'Note deleted successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  return authHandler(context);
}; 