import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Play, Clock } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';
import { useTaskContext } from './DragDropContext';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    estimatedTime?: number;
  };
  onTaskClick: (task: any) => void;
}

function TaskItem({ task, onTaskClick }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Mock progress calculation - in a real app this would come from actual time tracking
  const mockProgress = Math.min(60 + Math.random() * 30, 90); // Random progress between 60-90%
  const mockStartTime = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago
  
  const getElapsedTime = (startTime: Date) => {
    const elapsed = Date.now() - startTime.getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const { hours, minutes } = getElapsedTime(mockStartTime);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-blue-400/10 rounded-lg border border-blue-400/30 cursor-grab active:cursor-grabbing hover:border-blue-400/50 transition-colors"
      onClick={(e) => {
        if (!isDragging && e.target === e.currentTarget) {
          onTaskClick(task);
        }
      }}
    >
      <h4 className="text-white font-medium mb-2">{task.title}</h4>
      <div className="space-y-2">
        <Progress value={mockProgress} className="h-2 bg-slate-700" />
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-blue-400">
            <Clock className="w-3 h-3" />
            <span>
              {hours > 0 ? `${hours}h ` : ''}{minutes}m elapsed
            </span>
          </div>
          <span className="text-slate-400">
            ~{task.estimatedTime || 0}h estimated
          </span>
        </div>
      </div>
    </div>
  );
}

export function DoingTasksCard() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { tasks, updateTask, deleteTask } = useTaskContext();

  const { setNodeRef } = useDroppable({
    id: 'DOING',
  });

  const doingTasks = tasks.filter(task => task.status === 'DOING');

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleTaskSave = (updatedTask: any) => {
    updateTask(updatedTask);
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTask(taskId);
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-blue-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Play className="w-5 h-5" />
            In Progress
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              {doingTasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={setNodeRef}
            className="space-y-3 min-h-[150px] p-2 rounded-lg bg-slate-800/20 border-2 border-dashed border-blue-400/30"
          >
            {doingTasks.length === 0 ? (
              <div className="text-center text-slate-500 py-6">
                <Play className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>No active tasks</p>
                <p className="text-xs">Drop tasks here to start working</p>
              </div>
            ) : (
              doingTasks.map((task) => (
                <TaskItem key={task.id} task={task} onTaskClick={handleTaskClick} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <TaskDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        task={selectedTask}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
      />
    </>
  );
}