import React from 'react';
import { useModals } from './ModalsContext';
import { useMissionData } from './MissionDataContext';

// Import all modal components
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { CreateObjectiveModal } from './CreateObjectiveModal';
import { ObjectiveDetailModal } from './ObjectiveDetailModal';
import { CreateMeetingModal } from './CreateMeetingModal';
import { MeetingDetailModal } from './MeetingDetailModal';
import { ReminderDetailModal } from './ReminderDetailModal';

export function ModalsWrapper() {
  const modals = useModals();
  const missionData = useMissionData();

  // Helper function to get task data by ID
  const getTaskById = (taskId?: string) => {
    if (!taskId) return null;
    return missionData.tasks.get().find(task => task.id === taskId) || null;
  };

  // Helper function to get objective data by ID
  const getObjectiveById = (objectiveId?: string) => {
    if (!objectiveId) return null;
    return missionData.objectives.get().find(obj => obj.id === objectiveId) || null;
  };

  // Helper function to get meeting data by ID
  const getMeetingById = (meetingId?: string) => {
    if (!meetingId) return null;
    return missionData.meetings.get().find(meeting => meeting.id === meetingId) || null;
  };

  // Helper function to get reminder data by ID
  const getReminderById = (reminderId?: string) => {
    if (!reminderId) return null;
    return missionData.reminders.get().find(reminder => reminder.id === reminderId) || null;
  };

  // Task modal handlers
  const handleTaskSave = async (taskData: any) => {
    try {
      if (modals.tasks.mode === 'create') {
        console.log('Creating new task:', taskData);
        await missionData.tasks.create(taskData);
      } else if ((modals.tasks.mode === 'edit' || modals.tasks.mode === 'detail') && modals.tasks.taskId) {
        console.log('Updating task:', modals.tasks.taskId, taskData);
        // Ensure we have the task ID in the data
        const updateData = {
          ...taskData,
          id: modals.tasks.taskId
        };
        await missionData.tasks.update(modals.tasks.taskId, updateData);
      } else {
        console.error('Invalid task save operation:', {
          mode: modals.tasks.mode,
          taskId: modals.tasks.taskId,
          hasTaskData: !!taskData
        });
      }
      modals.tasks.close();
    } catch (error) {
      console.error('Error saving task:', error);
      // Don't close modal on error so user can retry
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      console.log('Deleting task:', taskId);
      await missionData.tasks.delete(taskId);
      modals.tasks.close();
    } catch (error) {
      console.error('Error deleting task:', error);
      // Don't close modal on error so user can retry
    }
  };

  // Objective modal handlers
  const handleObjectiveSave = async (objectiveData: any) => {
    if (modals.objectives.mode === 'create') {
      await missionData.objectives.create(objectiveData);
    } else if (modals.objectives.mode === 'edit' && modals.objectives.objectiveId) {
      await missionData.objectives.update(modals.objectives.objectiveId, objectiveData);
    }
    modals.objectives.close();
  };

  const handleObjectiveDelete = async (objectiveId: string) => {
    await missionData.objectives.delete(objectiveId);
    modals.objectives.close();
  };

  // Meeting modal handlers
  const handleMeetingSave = async (meetingData: any) => {
    if (modals.meetings.mode === 'create') {
      await missionData.meetings.create(meetingData);
    } else if (modals.meetings.mode === 'edit' && modals.meetings.meetingId) {
      await missionData.meetings.update(modals.meetings.meetingId, meetingData);
    }
    modals.meetings.close();
  };

  const handleMeetingDelete = async (meetingId: string) => {
    await missionData.meetings.delete(meetingId);
    modals.meetings.close();
  };

  // Reminder modal handlers
  const handleReminderSave = async (reminderData: any) => {
    if (modals.reminders.mode === 'create') {
      await missionData.reminders.create(reminderData);
    } else if (modals.reminders.mode === 'edit' && modals.reminders.reminderId) {
      await missionData.reminders.update(modals.reminders.reminderId, reminderData);
    }
    modals.reminders.close();
  };

  const handleReminderDelete = async (reminderId: string) => {
    await missionData.reminders.delete(reminderId);
    modals.reminders.close();
  };

  return (
    <>
      {/* Task Modals */}
      {modals.tasks.isOpen && modals.tasks.mode === 'create' && (
        <CreateTaskModal
          open={modals.tasks.isOpen}
          onOpenChange={(open) => !open && modals.tasks.close()}
        />
      )}

      {modals.tasks.isOpen && (modals.tasks.mode === 'edit' || modals.tasks.mode === 'detail') && (
        <TaskDetailModal
          open={modals.tasks.isOpen}
          onOpenChange={(open) => !open && modals.tasks.close()}
          task={getTaskById(modals.tasks.taskId) || modals.tasks.initialData}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
      )}

      {/* Objective Modals */}
      {modals.objectives.isOpen && modals.objectives.mode === 'create' && (
        <CreateObjectiveModal
          open={modals.objectives.isOpen}
          onOpenChange={(open) => !open && modals.objectives.close()}
        />
      )}

      {modals.objectives.isOpen && (modals.objectives.mode === 'edit' || modals.objectives.mode === 'detail') && (
        <ObjectiveDetailModal
          open={modals.objectives.isOpen}
          onOpenChange={(open) => !open && modals.objectives.close()}
          objective={getObjectiveById(modals.objectives.objectiveId) || modals.objectives.initialData}
          onSave={handleObjectiveSave}
          onDelete={handleObjectiveDelete}
        />
      )}

      {/* Meeting Modals */}
      {modals.meetings.isOpen && modals.meetings.mode === 'create' && (
        <CreateMeetingModal
          open={modals.meetings.isOpen}
          onOpenChange={(open) => !open && modals.meetings.close()}
        />
      )}

      {modals.meetings.isOpen && (modals.meetings.mode === 'edit' || modals.meetings.mode === 'detail') && (
        <MeetingDetailModal
          open={modals.meetings.isOpen}
          onOpenChange={(open) => !open && modals.meetings.close()}
          meeting={getMeetingById(modals.meetings.meetingId) || modals.meetings.initialData}
          onSave={handleMeetingSave}
          onDelete={handleMeetingDelete}
        />
      )}

      {/* Reminder Modals */}
      {modals.reminders.isOpen && (modals.reminders.mode === 'edit' || modals.reminders.mode === 'detail') && (
        <ReminderDetailModal
          open={modals.reminders.isOpen}
          onOpenChange={(open) => !open && modals.reminders.close()}
          reminder={getReminderById(modals.reminders.reminderId) || modals.reminders.initialData}
          onSave={handleReminderSave}
          onDelete={handleReminderDelete}
        />
      )}

      {/* Note Modals - TODO: Implement when note modals are created */}
      {/* 
      {modals.notes.isOpen && modals.notes.mode === 'create' && (
        <CreateNoteModal ... />
      )}
      
      {modals.notes.isOpen && (modals.notes.mode === 'edit' || modals.notes.mode === 'detail') && (
        <NoteDetailModal ... />
      )}
      */}
    </>
  );
} 