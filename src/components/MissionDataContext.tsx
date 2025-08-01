import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

// Types for our entities
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'BACKLOG' | 'TODAY' | 'DOING' | 'COMPLETED' | 'TOMORROW';
  limitDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  details?: string;
  peopleHelp?: string[];
  timeNeeded?: number;
  purpose?: string;
  existing?: string;
  complexities?: string;
  resources?: any;
  objectiveId?: string;
  userId: string;
}

interface Objective {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  status: 'ACTIVE' | 'ACHIEVED' | 'ABORTED' | 'INTERRUPTED' | 'ARCHIVED' | 'PAUSED';
  priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  updatedAt: string;
  details?: string;
  peopleHelp?: string[];
  timeNeeded?: number;
  purpose?: string;
  existing?: string;
  complexities?: string;
  resources?: any;
  userId: string;
}

interface Reminder {
  id: string;
  text: string;
  date: string;
  isNear: boolean;
  alertEnabled: boolean;
  alertMinutes: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  datetime: string;
  duration?: number;
  alertEnabled: boolean;
  alertMinutes: number;
  completed: boolean;
  participants?: string[];
  location?: string;
  type?: 'standup' | 'review' | 'planning' | 'other';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface Note {
  id: string;
  title?: string;
  content: string;
  project?: string;
  tags: string[];
  isNotebook: boolean;
  notebookDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface Settings {
  id: string;
  startHour: number;
  endHour: number;
  lunchStart: number;
  lunchEnd: number;
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  meetingAlert: number;
  audioEnabled: boolean;
  audioVolume: number;
  pomodoroSounds: boolean;
  notificationSounds: boolean;
  uiSounds: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Loading states for each entity
interface LoadingState {
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Entity managers interface
interface EntityManager<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  get: () => T[];
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
  delete: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

// Task-specific operations
interface TaskOperations {
  moveTask: {
    from: (fromStatus: Task['status']) => {
      to: (toStatus: Task['status']) => Promise<boolean>;
    };
  };
}

// Main mission data interface
interface MissionDataContextType {
  tasks: EntityManager<Task>;
  objectives: EntityManager<Objective>;
  reminders: EntityManager<Reminder>;
  meetings: EntityManager<Meeting>;
  notes: EntityManager<Note>;
  settings: EntityManager<Settings>;
  
  // Special operations
  moveTask: TaskOperations['moveTask'];
  
  // Global loading state
  globalLoading: {
    isHydrating: boolean;
    completedCount: number;
    totalCount: number;
    errors: string[];
    allLoaded: boolean;
  };
  
  // Control functions
  retryFailedLoads: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const MissionDataContext = createContext<MissionDataContextType | undefined>(undefined);

export function useMissionData() {
  const context = useContext(MissionDataContext);
  if (context === undefined) {
    throw new Error('useMissionData must be used within a MissionDataProvider');
  }
  return context;
}

interface MissionDataProviderProps {
  children: ReactNode;
}

export function MissionDataProvider({ children }: MissionDataProviderProps) {
  // Entity states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    tasks: { isLoading: false, error: null, isInitialized: false } as LoadingState,
    objectives: { isLoading: false, error: null, isInitialized: false } as LoadingState,
    reminders: { isLoading: false, error: null, isInitialized: false } as LoadingState,
    meetings: { isLoading: false, error: null, isInitialized: false } as LoadingState,
    notes: { isLoading: false, error: null, isInitialized: false } as LoadingState,
    settings: { isLoading: false, error: null, isInitialized: false } as LoadingState,
  });

  // Helper function to make authenticated requests
  const makeRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Update loading state helper
  const updateLoadingState = (entity: keyof typeof loadingStates, updates: Partial<LoadingState>) => {
    setLoadingStates(prev => ({
      ...prev,
      [entity]: { ...prev[entity], ...updates }
    }));
  };

  // Generic entity operations factory
  const createEntityManager = <T extends { id: string }>(
    entityName: keyof typeof loadingStates,
    data: T[],
    setData: React.Dispatch<React.SetStateAction<T[]>>,
    apiEndpoint: string
  ): EntityManager<T> => {
    const loadingState = loadingStates[entityName];

    const get = () => data;

    const refresh = async () => {
      try {
        updateLoadingState(entityName, { isLoading: true, error: null });
        const result = await makeRequest(`/api/${apiEndpoint}`);
        
        if (result.success) {
          setData(result[apiEndpoint] || []);
          updateLoadingState(entityName, { isLoading: false, isInitialized: true });
        } else {
          throw new Error(result.error || 'Failed to load data');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateLoadingState(entityName, { isLoading: false, error: errorMessage });
        console.error(`Error loading ${entityName}:`, error);
      }
    };

    const create = async (createData: Partial<T>): Promise<T | null> => {
      try {
        const result = await makeRequest(`/api/${apiEndpoint}`, {
          method: 'POST',
          body: JSON.stringify(createData),
        });

        if (result.success) {
          const newItem = result[entityName.slice(0, -1)]; // Remove 's' from end
          setData(prev => [newItem, ...prev]);
          return newItem;
        } else {
          throw new Error(result.error || 'Failed to create item');
        }
      } catch (error) {
        console.error(`Error creating ${entityName}:`, error);
        return null;
      }
    };

    const update = async (id: string, updateData: Partial<T>): Promise<T | null> => {
      try {
        console.log(`MissionData: Updating ${entityName} ${id} with data:`, updateData);
        
        // Optimistic update: immediately update the UI
        const originalData = [...data];
        const itemToUpdate = data.find(item => item.id === id);
        
        if (itemToUpdate) {
          const optimisticItem = { ...itemToUpdate, ...updateData };
          setData(prev => prev.map(item => item.id === id ? optimisticItem : item));
          console.log(`MissionData: Applied optimistic update for ${entityName} ${id}`);
        }

        // Make the actual API call
        const result = await makeRequest(`/api/${apiEndpoint}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData),
        });

        console.log(`MissionData: ${entityName} update result:`, result);

        if (result.success) {
          const itemKey = entityName.slice(0, -1); // Remove 's' from end
          const updatedItem = result[itemKey];
          console.log(`MissionData: Updated ${entityName} item:`, updatedItem);
          
          if (updatedItem) {
            // Update with the server response
            setData(prev => {
              const newData = prev.map(item => item.id === id ? updatedItem : item);
              console.log(`MissionData: Updated ${entityName} data:`, newData);
              return newData;
            });
            return updatedItem;
          } else {
            console.error(`MissionData: No ${itemKey} in response:`, result);
            throw new Error(`No ${itemKey} in response`);
          }
        } else {
          // Rollback optimistic update on error
          setData(originalData);
          console.log(`MissionData: Rolled back optimistic update for ${entityName} ${id}`);
          throw new Error(result.error || 'Failed to update item');
        }
      } catch (error) {
        console.error(`Error updating ${entityName}:`, error);
        // Rollback optimistic update on error
        setData(prev => prev.map(item => item.id === id ? data.find(d => d.id === id)! : item));
        return null;
      }
    };

    const deleteItem = async (id: string): Promise<boolean> => {
      try {
        const result = await makeRequest(`/api/${apiEndpoint}/${id}`, {
          method: 'DELETE',
        });

        if (result.success) {
          setData(prev => prev.filter(item => item.id !== id));
          return true;
        } else {
          throw new Error(result.error || 'Failed to delete item');
        }
      } catch (error) {
        console.error(`Error deleting ${entityName}:`, error);
        return false;
      }
    };

    return {
      data,
      isLoading: loadingState.isLoading,
      error: loadingState.error,
      isInitialized: loadingState.isInitialized,
      get,
      create,
      update,
      delete: deleteItem,
      refresh,
    };
  };

  // Special task operations
  const moveTask = {
    from: (fromStatus: Task['status']) => ({
      to: async (toStatus: Task['status']): Promise<boolean> => {
        // Find the first task with the fromStatus
        const taskToMove = tasks.find(task => task.status === fromStatus);
        
        if (!taskToMove) {
          console.warn(`No task found with status: ${fromStatus}`);
          return false;
        }

        // Update the task status
        const updatedTask = await taskManager.update(taskToMove.id, { status: toStatus });
        return !!updatedTask;
      }
    })
  };

  // Create entity managers
  const taskManager = createEntityManager('tasks', tasks, setTasks, 'tasks');
  const objectiveManager = createEntityManager('objectives', objectives, setObjectives, 'objectives');
  const reminderManager = createEntityManager('reminders', reminders, setReminders, 'reminders');
  const meetingManager = createEntityManager('meetings', meetings, setMeetings, 'meetings');
  const noteManager = createEntityManager('notes', notes, setNotes, 'notes');
  
  // Custom settings manager (uses POST for updates instead of PUT)
  const settingsManager: EntityManager<Settings> = {
    data: settings,
    isLoading: loadingStates.settings.isLoading,
    error: loadingStates.settings.error,
    isInitialized: loadingStates.settings.isInitialized,
    get: () => settings,
    create: async (createData: Partial<Settings>): Promise<Settings | null> => {
      try {
        const result = await makeRequest('/api/settings', {
          method: 'POST',
          body: JSON.stringify(createData),
        });

        if (result.success) {
          const newSettings = result.settings[0];
          setSettings([newSettings]);
          return newSettings;
        } else {
          throw new Error(result.error || 'Failed to create settings');
        }
      } catch (error) {
        console.error('Error creating settings:', error);
        return null;
      }
    },
    update: async (id: string, updateData: Partial<Settings>): Promise<Settings | null> => {
      try {
        console.log('MissionData: Updating settings with data:', updateData);
        
        // Optimistic update: immediately update the UI
        const originalData = [...settings];
        const itemToUpdate = settings.find(item => item.id === id);
        
        if (itemToUpdate) {
          const optimisticItem = { ...itemToUpdate, ...updateData };
          setSettings([optimisticItem]);
          console.log('MissionData: Applied optimistic update for settings');
        }

        // Make the actual API call using POST (not PUT)
        const result = await makeRequest('/api/settings', {
          method: 'POST',
          body: JSON.stringify(updateData),
        });

        console.log('MissionData: Settings update result:', result);

        if (result.success) {
          const updatedSettings = result.settings[0];
          console.log('MissionData: Updated settings:', updatedSettings);
          
          if (updatedSettings) {
            // Update with the server response
            setSettings([updatedSettings]);
            console.log('MissionData: Updated settings data');
            return updatedSettings;
          } else {
            console.error('MissionData: No settings in response:', result);
            throw new Error('No settings in response');
          }
        } else {
          // Rollback optimistic update on error
          setSettings(originalData);
          console.log('MissionData: Rolled back optimistic update for settings');
          throw new Error(result.error || 'Failed to update settings');
        }
      } catch (error) {
        console.error('Error updating settings:', error);
        // Rollback optimistic update on error
        setSettings(prev => prev.map(item => item.id === id ? settings.find(s => s.id === id)! : item));
        return null;
      }
    },
    delete: async (id: string): Promise<boolean> => {
      // Settings don't support deletion
      console.warn('Settings deletion not supported');
      return false;
    },
    refresh: async () => {
      try {
        updateLoadingState('settings', { isLoading: true, error: null });
        const result = await makeRequest('/api/settings');
        
        if (result.success) {
          setSettings(result.settings || []);
          updateLoadingState('settings', { isLoading: false, isInitialized: true });
        } else {
          throw new Error(result.error || 'Failed to load settings');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateLoadingState('settings', { isLoading: false, error: errorMessage });
        console.error('Error loading settings:', error);
      }
    },
  };

  // Global loading calculations
  const globalLoading = {
    isHydrating: Object.values(loadingStates).some(state => state.isLoading && !state.isInitialized),
    completedCount: Object.values(loadingStates).filter(state => state.isInitialized).length,
    totalCount: Object.keys(loadingStates).length,
    errors: Object.values(loadingStates).filter(state => state.error).map(state => state.error!),
    allLoaded: Object.values(loadingStates).every(state => state.isInitialized),
  };

  // Control functions
  const retryFailedLoads = async () => {
    const failedEntities = Object.entries(loadingStates)
      .filter(([_, state]) => state.error && !state.isInitialized)
      .map(([entity]) => entity);

    await Promise.all(failedEntities.map(entity => {
      switch (entity) {
        case 'tasks': return taskManager.refresh();
        case 'objectives': return objectiveManager.refresh();
        case 'reminders': return reminderManager.refresh();
        case 'meetings': return meetingManager.refresh();
        case 'notes': return noteManager.refresh();
        case 'settings': return settingsManager.refresh();
        default: return Promise.resolve();
      }
    }));
  };

  const refreshAll = async () => {
    await Promise.all([
      taskManager.refresh(),
      objectiveManager.refresh(),
      reminderManager.refresh(),
      meetingManager.refresh(),
      noteManager.refresh(),
      settingsManager.refresh(),
    ]);
  };

  // Initial data loading
  useEffect(() => {
    refreshAll();
  }, []);

  const value: MissionDataContextType = {
    tasks: taskManager,
    objectives: objectiveManager,
    reminders: reminderManager,
    meetings: meetingManager,
    notes: noteManager,
    settings: settingsManager,
    moveTask,
    globalLoading,
    retryFailedLoads,
    refreshAll,
  };

  return (
    <MissionDataContext.Provider value={value}>
      {children}
    </MissionDataContext.Provider>
  );
} 