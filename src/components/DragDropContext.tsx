import React, { createContext, useContext, useCallback, useState } from 'react';
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
import { Clock } from 'lucide-react';
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

// Drag Overlay Component
function TaskDragOverlay({ task }: { task: Task }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ASAP': return 'border-red-400 text-red-400';
      case 'HIGH': return 'border-orange-400 text-orange-400';
      case 'MEDIUM': return 'border-yellow-400 text-yellow-400';
      case 'LOW': return 'border-green-400 text-green-400';
      default: return 'border-slate-400 text-slate-400';
    }
  };

  return (
    <div className="p-3 bg-slate-700 rounded-lg border border-slate-600 shadow-lg opacity-90 cursor-grabbing transform rotate-2 scale-105">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="text-white font-medium text-sm flex-1">{task.title}</h4>
          <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-slate-400 text-xs line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{task.timeNeeded || 0}h</span>
          </div>
          
          {task.limitDate && (
            <div className="text-orange-400">
              {new Date(task.limitDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TaskDragDropProvider({ children }: TaskDragDropProviderProps) {
  const missionData = useMissionData();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;
    const task = missionData.tasks.get().find(t => t.id === taskId);
    if (task) {
      setActiveTask(task);
      console.log('Started dragging task:', task.title);
    }
  }, [missionData.tasks]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) {
      setActiveTask(null);
      return;
    }
    
    const taskId = active.id as string;
    const targetContainerId = over.id as string;
    const newStatus = getStatusFromContainerId(targetContainerId);
    
    // Find the current task
    const currentTask = missionData.tasks.get().find(task => task.id === taskId);
    if (!currentTask) {
      setActiveTask(null);
      return;
    }
    
    // Skip update if task is already in the target status
    if (currentTask.status === newStatus) {
      setActiveTask(null);
      return;
    }

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

    setActiveTask(null);
  }, [missionData.tasks]);

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
          {activeTask ? (
            <TaskDragOverlay task={activeTask} />
          ) : null}
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