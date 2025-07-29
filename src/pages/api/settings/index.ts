import type { APIRoute } from 'astro';
import { withAuth } from '../../../lib/middleware';
import { prisma } from '../../../lib/prisma';

export const GET: APIRoute = async (context) => {
  return withAuth(async ({ request }) => {
    try {
      // Get user's settings
      const settings = await prisma.settings.findUnique({
        where: { userId: request.user.id }
      });

      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = await prisma.settings.create({
          data: {
            userId: request.user.id,
            startHour: 9,
            endHour: 18,
            lunchStart: 13,
            lunchEnd: 14,
            workDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            meetingAlert: 5,
            audioEnabled: true,
            audioVolume: 0.5,
            pomodoroSounds: true,
            notificationSounds: true,
            uiSounds: false
          }
        });

        return new Response(JSON.stringify({
          success: true,
          settings: [defaultSettings]
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        settings: [settings]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to fetch settings' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  })(context);
};

export const POST: APIRoute = async (context) => {
  return withAuth(async ({ request }) => {
    try {
      const body = await request.json();
      
      // Check if user has settings
      const existingSettings = await prisma.settings.findUnique({
        where: { userId: request.user.id }
      });

      let settings;
      if (existingSettings) {
        // Update existing settings
        settings = await prisma.settings.update({
          where: { userId: request.user.id },
          data: {
            startHour: body.startHour || 9,
            endHour: body.endHour || 18,
            lunchStart: body.lunchStart || 13,
            lunchEnd: body.lunchEnd || 14,
            workDuration: body.workDuration || 25,
            shortBreak: body.shortBreak || 5,
            longBreak: body.longBreak || 15,
            meetingAlert: body.meetingAlert || 5,
            audioEnabled: body.audioEnabled || true,
            audioVolume: body.audioVolume || 0.5,
            pomodoroSounds: body.pomodoroSounds || true,
            notificationSounds: body.notificationSounds || true,
            uiSounds: body.uiSounds || false
          }
        });
      } else {
        // Create new settings
        settings = await prisma.settings.create({
          data: {
            userId: request.user.id,
            startHour: body.startHour || 9,
            endHour: body.endHour || 18,
            lunchStart: body.lunchStart || 13,
            lunchEnd: body.lunchEnd || 14,
            workDuration: body.workDuration || 25,
            shortBreak: body.shortBreak || 5,
            longBreak: body.longBreak || 15,
            meetingAlert: body.meetingAlert || 5,
            audioEnabled: body.audioEnabled || true,
            audioVolume: body.audioVolume || 0.5,
            pomodoroSounds: body.pomodoroSounds || true,
            notificationSounds: body.notificationSounds || true,
            uiSounds: body.uiSounds || false
          }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        settings: [settings]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to save settings' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  })(context);
};