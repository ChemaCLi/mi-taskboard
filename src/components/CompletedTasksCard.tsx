import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, Trophy } from 'lucide-react';
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
    priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
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

  // Mock completion time - in a real app this would come from actual data
  const mockCompletedAt = new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000); // Random time within last 6 hours

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 bg-emerald-400/10 rounded border border-emerald-400/30 cursor-grab active:cursor-grabbing hover:border-emerald-400/50 transition-colors"
      onClick={(e) => {
        if (!isDragging && e.target === e.currentTarget) {
          onTaskClick(task);
        }
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-white text-sm">{task.title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{task.estimatedTime || 0}h</span>
          <Badge 
            variant="outline" 
            className="text-xs border-emerald-400 text-emerald-400"
          >
            ✓
          </Badge>
        </div>
      </div>
      <div className="text-xs text-slate-500 mt-1">
        {mockCompletedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

export function CompletedTasksCard() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { tasks, updateTask, deleteTask } = useTaskContext();

  const { setNodeRef } = useDroppable({
    id: 'COMPLETED',
  });

  const completedTasks = tasks.filter(task => task.status === 'COMPLETED');

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

  const totalXP = completedTasks.reduce((total, task) => {
    const priorityXP = {
      'ASAP': 100,
      'HIGH': 75,
      'MEDIUM': 50,
      'LOW': 25
    };
    return total + (priorityXP[task.priority] || 0);
  }, 0);

  return (
    <>
      <Card className="bg-slate-800/50 border-emerald-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Completed Today
              <Badge variant="outline" className="border-emerald-400 text-emerald-400">
                {completedTasks.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">{totalXP} XP</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={setNodeRef}
            className="space-y-2 max-h-48 overflow-y-auto min-h-[150px] p-2 rounded-lg bg-slate-800/20 border-2 border-dashed border-emerald-400/30"
          >
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} onTaskClick={handleTaskClick} />
            ))}
            {completedTasks.length === 0 && (
              <div className="text-center text-slate-500 py-6">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>No completed tasks</p>
                <p className="text-xs">Completed tasks will appear here</p>
              </div>
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