import React, { createContext, useContext, useState } from 'react';
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

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'BACKLOG' | 'TODAY' | 'DOING' | 'COMPLETED' | 'TOMORROW';
  limitDate?: Date;
  estimatedTime?: number;
  complexity?: 'Simple' | 'Moderate' | 'Complex';
  tags?: string[];
  objectiveId?: string;
}

interface TaskContextType {
  tasks: Task[];
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  activeTask: Task | null;
}

const TaskContext = createContext<TaskContextType | null>(null);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: React.ReactNode;
}

// Mock initial tasks data
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Fix critical login bug',
    description: 'Users cant login with Google OAuth',
    priority: 'ASAP',
    status: 'BACKLOG',
    limitDate: new Date('2025-01-29'),
    estimatedTime: 2,
    complexity: 'Moderate',
    tags: ['bug', 'auth', 'critical'],
    objectiveId: 'obj-2' // Connected to User Authentication objective
  },
  {
    id: '2',
    title: 'Update user profile API',
    description: 'Add new fields for user preferences',
    priority: 'HIGH',
    status: 'BACKLOG',
    limitDate: new Date('2025-01-30'),
    estimatedTime: 4,
    complexity: 'Moderate',
    tags: ['api', 'backend'],
    objectiveId: 'obj-2' // Connected to User Authentication objective
  },
  {
    id: '3',
    title: 'Review pull requests',
    priority: 'HIGH',
    status: 'TODAY',
    estimatedTime: 1,
    tags: ['review']
  },
  {
    id: '4',
    title: 'Update documentation',
    priority: 'MEDIUM',
    status: 'TODAY',
    estimatedTime: 2,
    tags: ['docs']
  },
  {
    id: '5',
    title: 'Implementing user authentication',
    priority: 'HIGH',
    status: 'DOING',
    estimatedTime: 2,
    tags: ['feature', 'auth'],
    objectiveId: 'obj-2' // Connected to User Authentication objective
  },
  {
    id: '6',
    title: 'Team standup meeting',
    priority: 'HIGH',
    status: 'COMPLETED',
    estimatedTime: 0.5,
    tags: ['meeting']
  },
  {
    id: '7',
    title: 'Code review for dashboard',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    estimatedTime: 1,
    tags: ['review'],
    objectiveId: 'obj-1' // Connected to Dashboard Redesign objective
  },
  {
    id: '8',
    title: 'Design new feature wireframes',
    priority: 'HIGH',
    status: 'TOMORROW',
    estimatedTime: 3,
    tags: ['design'],
    objectiveId: 'obj-1' // Connected to Dashboard Redesign objective
  },
  {
    id: '9',
    title: 'Refactor authentication module',
    priority: 'MEDIUM',
    status: 'TOMORROW',
    estimatedTime: 4,
    tags: ['refactor', 'auth'],
    objectiveId: 'obj-2' // Connected to User Authentication objective
  }
];

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeTask = tasks.find(task => task.id === active.id);
    setActiveTask(activeTask || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeTaskId = active.id as string;
    const overContainerId = over.id as string;

    // If dropped on a droppable container (status column)
    if (['BACKLOG', 'TODAY', 'DOING', 'COMPLETED', 'TOMORROW'].includes(overContainerId)) {
      updateTaskStatus(activeTaskId, overContainerId as Task['status']);
    }

    setActiveTask(null);
  };

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
    <TaskContext.Provider value={{ tasks, updateTaskStatus, updateTask, deleteTask, activeTask }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {activeTask ? (
            <div className="p-3 bg-slate-700 rounded-lg border border-slate-600 shadow-lg opacity-90 cursor-grabbing">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium flex-1">{activeTask.title}</h4>
                <Badge className={getPriorityColor(activeTask.priority)}>
                  {activeTask.priority}
                </Badge>
              </div>
              {activeTask.description && (
                <p className="text-slate-400 text-sm">{activeTask.description}</p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </TaskContext.Provider>
  );
} 