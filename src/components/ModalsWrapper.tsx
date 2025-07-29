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
import { CreateReminderModal } from './CreateReminderModal';
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
    try {
      if (modals.objectives.mode === 'create') {
        console.log('Creating new objective:', objectiveData);
        await missionData.objectives.create(objectiveData);
      } else if ((modals.objectives.mode === 'edit' || modals.objectives.mode === 'detail') && modals.objectives.objectiveId) {
        console.log('Updating objective:', modals.objectives.objectiveId, objectiveData);
        // Ensure we have the objective ID in the data
        const updateData = {
          ...objectiveData,
          id: modals.objectives.objectiveId
        };
        await missionData.objectives.update(modals.objectives.objectiveId, updateData);
      } else {
        console.error('Invalid objective save operation:', {
          mode: modals.objectives.mode,
          objectiveId: modals.objectives.objectiveId,
          hasObjectiveData: !!objectiveData
        });
      }
      modals.objectives.close();
    } catch (error) {
      console.error('Error saving objective:', error);
      // Don't close modal on error so user can retry
    }
  };

  const handleObjectiveDelete = async (objectiveId: string) => {
    try {
      console.log('Deleting objective:', objectiveId);
      await missionData.objectives.delete(objectiveId);
      modals.objectives.close();
    } catch (error) {
      console.error('Error deleting objective:', error);
      // Don't close modal on error so user can retry
    }
  };

  // Meeting modal handlers
  const handleMeetingSave = async (meetingData: any) => {
    try {
      if (modals.meetings.mode === 'create') {
        console.log('Creating new meeting:', meetingData);
        await missionData.meetings.create(meetingData);
      } else if ((modals.meetings.mode === 'edit' || modals.meetings.mode === 'detail') && modals.meetings.meetingId) {
        console.log('Updating meeting:', modals.meetings.meetingId, meetingData);
        // Ensure we have the meeting ID in the data
        const updateData = {
          ...meetingData,
          id: modals.meetings.meetingId
        };
        await missionData.meetings.update(modals.meetings.meetingId, updateData);
      } else {
        console.error('Invalid meeting save operation:', {
          mode: modals.meetings.mode,
          meetingId: modals.meetings.meetingId,
          hasMeetingData: !!meetingData
        });
      }
      modals.meetings.close();
    } catch (error) {
      console.error('Error saving meeting:', error);
      // Don't close modal on error so user can retry
    }
  };

  const handleMeetingDelete = async (meetingId: string) => {
    try {
      console.log('Deleting meeting:', meetingId);
      await missionData.meetings.delete(meetingId);
      modals.meetings.close();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      // Don't close modal on error so user can retry
    }
  };

  // Reminder modal handlers
  const handleReminderSave = async (reminderData: any) => {
    try {
      if (modals.reminders.mode === 'create') {
        console.log('Creating new reminder:', reminderData);
        await missionData.reminders.create(reminderData);
      } else if ((modals.reminders.mode === 'edit' || modals.reminders.mode === 'detail') && modals.reminders.reminderId) {
        console.log('Updating reminder:', modals.reminders.reminderId, reminderData);
        // Ensure we have the reminder ID in the data
        const updateData = {
          ...reminderData,
          id: modals.reminders.reminderId
        };
        await missionData.reminders.update(modals.reminders.reminderId, updateData);
      } else {
        console.error('Invalid reminder save operation:', {
          mode: modals.reminders.mode,
          reminderId: modals.reminders.reminderId,
          hasReminderData: !!reminderData
        });
      }
      modals.reminders.close();
    } catch (error) {
      console.error('Error saving reminder:', error);
      // Don't close modal on error so user can retry
    }
  };

  const handleReminderDelete = async (reminderId: string) => {
    try {
      console.log('Deleting reminder:', reminderId);
      await missionData.reminders.delete(reminderId);
      modals.reminders.close();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      // Don't close modal on error so user can retry
    }
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
          onSave={handleObjectiveSave} // Pass centralized save handler
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
          onSave={handleMeetingSave} // Pass centralized save handler
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
      {modals.reminders.isOpen && modals.reminders.mode === 'create' && (
        <CreateReminderModal
          open={modals.reminders.isOpen}
          onOpenChange={(open) => !open && modals.reminders.close()}
          onSave={handleReminderSave} // Pass centralized save handler
        />
      )}

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