import React, { createContext, useContext, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Badge } from './ui/badge';
import { useMissionData } from './MissionDataContext';

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

interface TaskDragDropContextType {
  // This context is now mainly for providing the DndContext wrapper
  // The actual data operations are handled by MissionDataContext
}

const TaskDragDropContext = createContext<TaskDragDropContextType | undefined>(undefined);

export const useTaskDragDropContext = () => {
  const context = useContext(TaskDragDropContext);
  if (!context) {
    throw new Error('useTaskDragDropContext must be used within a TaskDragDropProvider');
  }
  return context;
};

interface TaskDragDropProviderProps {
  children: React.ReactNode;
}

export function TaskDragDropProvider({ children }: TaskDragDropProviderProps) {
  const missionData = useMissionData();
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Require dragging at least 3px to activate
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Map container IDs to task statuses
  const getStatusFromContainerId = (containerId: string): 'BACKLOG' | 'TODAY' | 'DOING' | 'COMPLETED' | 'TOMORROW' => {
    switch (containerId) {
      case 'BACKLOG':
        return 'BACKLOG';
      case 'TODAY':
        return 'TODAY';
      case 'DOING':
        return 'DOING';
      case 'COMPLETED':
        return 'COMPLETED';
      case 'TOMORROW':
        return 'TOMORROW';
      default:
        return 'BACKLOG'; // fallback
    }
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;
    
    const taskId = active.id as string;
    const targetContainerId = over.id as string;
    const newStatus = getStatusFromContainerId(targetContainerId);
    
    // Find the current task
    const currentTask = missionData.tasks.get().find(task => task.id === taskId);
    if (!currentTask) return;
    
    // Skip update if task is already in the target status
    if (currentTask.status === newStatus) return;

    console.log(`Moving task ${taskId} from ${currentTask.status} to ${newStatus}`);

    // Prepare update data
    const updateData: Partial<Task> = {
      status: newStatus,
    };

    // Special handling for completed tasks
    if (newStatus === 'COMPLETED' && currentTask.status !== 'COMPLETED') {
      updateData.completedAt = new Date().toISOString();
    } else if (newStatus !== 'COMPLETED' && currentTask.status === 'COMPLETED') {
      // Moving out of completed - clear completedAt
      updateData.completedAt = undefined;
    }

    try {
      // Optimistic update: immediately update the UI
      // The MissionDataContext will handle the optimistic update and API call
      await missionData.tasks.update(taskId, updateData);
      
      console.log(`Successfully moved task ${taskId} to ${newStatus}`);
    } catch (error) {
      console.error('Error moving task:', error);
      // The MissionDataContext should handle error rollback
    }
  }, [missionData.tasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    // This can be used for visual feedback during drag operations
    // For now, we'll keep it simple
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ASAP': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-600 text-white';
      case 'MEDIUM': return 'bg-yellow-600 text-black';
      case 'LOW': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <TaskDragDropContext.Provider value={{}}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {/* We'll handle the drag overlay in individual components if needed */}
        </DragOverlay>
      </DndContext>
    </TaskDragDropContext.Provider>
  );
}

// Legacy export for backwards compatibility - but components should use MissionDataContext directly
export const useTaskContext = () => {
  console.warn('useTaskContext is deprecated. Components should use useMissionData() directly.');
  const missionData = useMissionData();
  
  return {
    tasks: missionData.tasks.get(),
    updateTask: missionData.tasks.update,
    deleteTask: missionData.tasks.delete,
    isLoading: missionData.tasks.isLoading,
    error: missionData.tasks.error,
  };
}; 