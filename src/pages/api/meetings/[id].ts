import type { APIRoute } from 'astro';
import { withAuth } from '../../../lib/middleware';
import { prisma } from '../../../lib/prisma';

export const GET: APIRoute = async (context) => {
  const authHandler = withAuth(async ({ request }) => {
    try {
      const meetingId = context.params?.id;
      if (!meetingId) {
        return new Response(JSON.stringify({ success: false, error: 'Meeting ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meetingId,
          userId: (request as any).user.id
        }
      });

      if (!meeting) {
        return new Response(JSON.stringify({ success: false, error: 'Meeting not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, meeting }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching meeting:', error);
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
      const meetingId = context.params?.id;
      if (!meetingId) {
        return new Response(JSON.stringify({ success: false, error: 'Meeting ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const data = await request.json();
      const { title, description, datetime, duration, alertEnabled, alertMinutes, completed, participants, location, type } = data;

      // Verify the meeting belongs to the user
      const existingMeeting = await prisma.meeting.findFirst({
        where: {
          id: meetingId,
          userId: (request as any).user.id
        }
      });

      if (!existingMeeting) {
        return new Response(JSON.stringify({ success: false, error: 'Meeting not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Build update data object conditionally
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (datetime !== undefined) updateData.datetime = new Date(datetime);
      if (duration !== undefined) updateData.duration = duration;
      if (alertEnabled !== undefined) updateData.alertEnabled = alertEnabled;
      if (alertMinutes !== undefined) updateData.alertMinutes = alertMinutes;
      if (completed !== undefined) updateData.completed = completed;
      if (participants !== undefined) updateData.participants = participants;
      if (location !== undefined) updateData.location = location;
      if (type !== undefined) updateData.type = type;

      const updatedMeeting = await prisma.meeting.update({
        where: { id: meetingId },
        data: updateData
      });

      return new Response(JSON.stringify({ success: true, meeting: updatedMeeting }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error updating meeting:', error);
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
      const meetingId = context.params?.id;
      if (!meetingId) {
        return new Response(JSON.stringify({ success: false, error: 'Meeting ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Verify the meeting belongs to the user before deleting
      const existingMeeting = await prisma.meeting.findFirst({
        where: {
          id: meetingId,
          userId: (request as any).user.id
        }
      });

      if (!existingMeeting) {
        return new Response(JSON.stringify({ success: false, error: 'Meeting not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await prisma.meeting.delete({
        where: { id: meetingId }
      });

      return new Response(JSON.stringify({ success: true, message: 'Meeting deleted successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  return authHandler(context);
}; 