import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Modal state interfaces
interface TaskModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'detail';
  taskId?: string;
  initialData?: any;
}

interface ObjectiveModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'detail';
  objectiveId?: string;
  initialData?: any;
}

interface ReminderModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'detail';
  reminderId?: string;
  initialData?: any;
}

interface MeetingModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'detail';
  meetingId?: string;
  initialData?: any;
}

interface NoteModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'detail';
  noteId?: string;
  initialData?: any;
}

// Main modal state
interface ModalState {
  tasks: TaskModalState;
  objectives: ObjectiveModalState;
  reminders: ReminderModalState;
  meetings: MeetingModalState;
  notes: NoteModalState;
}

// Modal control interfaces
interface TaskModalControls {
  openNew: (initialData?: any) => void;
  edit: (taskId: string, initialData?: any) => void;
  showDetail: (taskId: string, initialData?: any) => void;
  close: () => void;
  isOpen: boolean;
  mode: 'create' | 'edit' | 'detail' | null;
  taskId?: string;
  initialData?: any;
}

interface ObjectiveModalControls {
  openNew: (initialData?: any) => void;
  edit: (objectiveId: string, initialData?: any) => void;
  showDetail: (objectiveId: string, initialData?: any) => void;
  close: () => void;
  isOpen: boolean;
  mode: 'create' | 'edit' | 'detail' | null;
  objectiveId?: string;
  initialData?: any;
}

interface ReminderModalControls {
  openNew: (initialData?: any) => void;
  edit: (reminderId: string, initialData?: any) => void;
  showDetail: (reminderId: string, initialData?: any) => void;
  close: () => void;
  isOpen: boolean;
  mode: 'create' | 'edit' | 'detail' | null;
  reminderId?: string;
  initialData?: any;
}

interface MeetingModalControls {
  openNew: (initialData?: any) => void;
  edit: (meetingId: string, initialData?: any) => void;
  showDetail: (meetingId: string, initialData?: any) => void;
  close: () => void;
  isOpen: boolean;
  mode: 'create' | 'edit' | 'detail' | null;
  meetingId?: string;
  initialData?: any;
}

interface NoteModalControls {
  openNew: (initialData?: any) => void;
  edit: (noteId: string, initialData?: any) => void;
  showDetail: (noteId: string, initialData?: any) => void;
  close: () => void;
  isOpen: boolean;
  mode: 'create' | 'edit' | 'detail' | null;
  noteId?: string;
  initialData?: any;
}

// Main modals interface
interface ModalsContextType {
  tasks: TaskModalControls;
  objectives: ObjectiveModalControls;
  reminders: ReminderModalControls;
  meetings: MeetingModalControls;
  notes: NoteModalControls;
  
  // Global controls
  closeAll: () => void;
  isAnyOpen: boolean;
}

const ModalsContext = createContext<ModalsContextType | undefined>(undefined);

export function useModals() {
  const context = useContext(ModalsContext);
  if (context === undefined) {
    throw new Error('useModals must be used within a ModalsProvider');
  }
  return context;
}

interface ModalsProviderProps {
  children: ReactNode;
}

export function ModalsProvider({ children }: ModalsProviderProps) {
  // Modal states
  const [modalState, setModalState] = useState<ModalState>({
    tasks: { isOpen: false, mode: 'create' },
    objectives: { isOpen: false, mode: 'create' },
    reminders: { isOpen: false, mode: 'create' },
    meetings: { isOpen: false, mode: 'create' },
    notes: { isOpen: false, mode: 'create' },
  });

  // Helper function to update specific modal state
  const updateModalState = <T extends keyof ModalState>(
    modalType: T,
    updates: Partial<ModalState[T]>
  ) => {
    setModalState(prev => ({
      ...prev,
      [modalType]: { ...prev[modalType], ...updates }
    }));
  };

  // Task modal controls
  const taskControls: TaskModalControls = {
    openNew: (initialData?: any) => {
      updateModalState('tasks', {
        isOpen: true,
        mode: 'create',
        taskId: undefined,
        initialData
      });
    },
    edit: (taskId: string, initialData?: any) => {
      updateModalState('tasks', {
        isOpen: true,
        mode: 'edit',
        taskId,
        initialData
      });
    },
    showDetail: (taskId: string, initialData?: any) => {
      updateModalState('tasks', {
        isOpen: true,
        mode: 'detail',
        taskId,
        initialData
      });
    },
    close: () => {
      updateModalState('tasks', {
        isOpen: false,
        taskId: undefined,
        initialData: undefined
      });
    },
    isOpen: modalState.tasks.isOpen,
    mode: modalState.tasks.isOpen ? modalState.tasks.mode : null,
    taskId: modalState.tasks.taskId,
    initialData: modalState.tasks.initialData,
  };

  // Objective modal controls
  const objectiveControls: ObjectiveModalControls = {
    openNew: (initialData?: any) => {
      updateModalState('objectives', {
        isOpen: true,
        mode: 'create',
        objectiveId: undefined,
        initialData
      });
    },
    edit: (objectiveId: string, initialData?: any) => {
      updateModalState('objectives', {
        isOpen: true,
        mode: 'edit',
        objectiveId,
        initialData
      });
    },
    showDetail: (objectiveId: string, initialData?: any) => {
      updateModalState('objectives', {
        isOpen: true,
        mode: 'detail',
        objectiveId,
        initialData
      });
    },
    close: () => {
      updateModalState('objectives', {
        isOpen: false,
        objectiveId: undefined,
        initialData: undefined
      });
    },
    isOpen: modalState.objectives.isOpen,
    mode: modalState.objectives.isOpen ? modalState.objectives.mode : null,
    objectiveId: modalState.objectives.objectiveId,
    initialData: modalState.objectives.initialData,
  };

  // Reminder modal controls
  const reminderControls: ReminderModalControls = {
    openNew: (initialData?: any) => {
      updateModalState('reminders', {
        isOpen: true,
        mode: 'create',
        reminderId: undefined,
        initialData
      });
    },
    edit: (reminderId: string, initialData?: any) => {
      updateModalState('reminders', {
        isOpen: true,
        mode: 'edit',
        reminderId,
        initialData
      });
    },
    showDetail: (reminderId: string, initialData?: any) => {
      updateModalState('reminders', {
        isOpen: true,
        mode: 'detail',
        reminderId,
        initialData
      });
    },
    close: () => {
      updateModalState('reminders', {
        isOpen: false,
        reminderId: undefined,
        initialData: undefined
      });
    },
    isOpen: modalState.reminders.isOpen,
    mode: modalState.reminders.isOpen ? modalState.reminders.mode : null,
    reminderId: modalState.reminders.reminderId,
    initialData: modalState.reminders.initialData,
  };

  // Meeting modal controls
  const meetingControls: MeetingModalControls = {
    openNew: (initialData?: any) => {
      updateModalState('meetings', {
        isOpen: true,
        mode: 'create',
        meetingId: undefined,
        initialData
      });
    },
    edit: (meetingId: string, initialData?: any) => {
      updateModalState('meetings', {
        isOpen: true,
        mode: 'edit',
        meetingId,
        initialData
      });
    },
    showDetail: (meetingId: string, initialData?: any) => {
      updateModalState('meetings', {
        isOpen: true,
        mode: 'detail',
        meetingId,
        initialData
      });
    },
    close: () => {
      updateModalState('meetings', {
        isOpen: false,
        meetingId: undefined,
        initialData: undefined
      });
    },
    isOpen: modalState.meetings.isOpen,
    mode: modalState.meetings.isOpen ? modalState.meetings.mode : null,
    meetingId: modalState.meetings.meetingId,
    initialData: modalState.meetings.initialData,
  };

  // Note modal controls
  const noteControls: NoteModalControls = {
    openNew: (initialData?: any) => {
      updateModalState('notes', {
        isOpen: true,
        mode: 'create',
        noteId: undefined,
        initialData
      });
    },
    edit: (noteId: string, initialData?: any) => {
      updateModalState('notes', {
        isOpen: true,
        mode: 'edit',
        noteId,
        initialData
      });
    },
    showDetail: (noteId: string, initialData?: any) => {
      updateModalState('notes', {
        isOpen: true,
        mode: 'detail',
        noteId,
        initialData
      });
    },
    close: () => {
      updateModalState('notes', {
        isOpen: false,
        noteId: undefined,
        initialData: undefined
      });
    },
    isOpen: modalState.notes.isOpen,
    mode: modalState.notes.isOpen ? modalState.notes.mode : null,
    noteId: modalState.notes.noteId,
    initialData: modalState.notes.initialData,
  };

  // Global controls
  const closeAll = () => {
    setModalState({
      tasks: { isOpen: false, mode: 'create' },
      objectives: { isOpen: false, mode: 'create' },
      reminders: { isOpen: false, mode: 'create' },
      meetings: { isOpen: false, mode: 'create' },
      notes: { isOpen: false, mode: 'create' },
    });
  };

  const isAnyOpen = Object.values(modalState).some(modal => modal.isOpen);

  const value: ModalsContextType = {
    tasks: taskControls,
    objectives: objectiveControls,
    reminders: reminderControls,
    meetings: meetingControls,
    notes: noteControls,
    closeAll,
    isAnyOpen,
  };

  return (
    <ModalsContext.Provider value={value}>
      {children}
    </ModalsContext.Provider>
  );
} 