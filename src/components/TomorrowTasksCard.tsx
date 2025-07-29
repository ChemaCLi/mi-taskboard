import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, Clock } from 'lucide-react';
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

  // Mock reason for being in tomorrow's queue
  const mockReasons = ['planned', 'moved', 'incomplete'];
  const mockReason = mockReasons[Math.floor(Math.random() * mockReasons.length)];

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'planned': return 'border-blue-400 text-blue-400';
      case 'moved': return 'border-yellow-400 text-yellow-400';
      case 'incomplete': return 'border-red-400 text-red-400';
      default: return 'border-gray-400 text-gray-400';
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'planned': return 'Planned';
      case 'moved': return 'Moved';
      case 'incomplete': return 'Incomplete';
      default: return 'Unknown';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 bg-slate-700/50 rounded border border-slate-600 hover:border-indigo-400/50 transition-colors cursor-grab active:cursor-grabbing"
      onClick={(e) => {
        if (!isDragging && e.target === e.currentTarget) {
          onTaskClick(task);
        }
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-white text-sm">{task.title}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{task.estimatedTime || 0}h</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Badge 
          variant="outline" 
          className={`text-xs ${getReasonColor(mockReason)}`}
        >
          {getReasonText(mockReason)}
        </Badge>
        <Badge 
          variant="outline" 
          className={`text-xs ${
            task.priority === 'ASAP' ? 'border-red-400 text-red-400' :
            task.priority === 'HIGH' ? 'border-orange-400 text-orange-400' :
            task.priority === 'MEDIUM' ? 'border-yellow-400 text-yellow-400' :
            'border-green-400 text-green-400'
          }`}
        >
          {task.priority}
        </Badge>
      </div>
    </div>
  );
}

export function TomorrowTasksCard() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { tasks, updateTask, deleteTask } = useTaskContext();

  const { setNodeRef } = useDroppable({
    id: 'TOMORROW',
  });

  const tomorrowTasks = tasks.filter(task => task.status === 'TOMORROW');

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
      <Card className="bg-slate-800/50 border-indigo-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <ArrowRight className="w-5 h-5" />
            Tomorrow's Queue
            <Badge variant="outline" className="border-indigo-400 text-indigo-400">
              {tomorrowTasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={setNodeRef}
            className="space-y-2 max-h-48 overflow-y-auto min-h-[150px] p-2 rounded-lg bg-slate-800/20 border-2 border-dashed border-indigo-400/30"
          >
            {tomorrowTasks.map((task) => (
              <TaskItem key={task.id} task={task} onTaskClick={handleTaskClick} />
            ))}
            {tomorrowTasks.length === 0 && (
              <div className="text-center text-slate-500 py-6">
                <ArrowRight className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>No tasks for tomorrow</p>
                <p className="text-xs">Drop tasks here for tomorrow</p>
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