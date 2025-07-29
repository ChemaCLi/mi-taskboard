import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, Archive, Calendar, AlertTriangle } from 'lucide-react';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { useTaskContext } from './DragDropContext';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    description?: string;
    priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
    limitDate?: Date;
    estimatedTime?: number;
    complexity?: 'Simple' | 'Moderate' | 'Complex';
    tags?: string[];
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ASAP': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-600 text-white';
      case 'MEDIUM': return 'bg-yellow-600 text-black';
      case 'LOW': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'border-green-400 text-green-400';
      case 'Moderate': return 'border-yellow-400 text-yellow-400';
      case 'Complex': return 'border-red-400 text-red-400';
      default: return 'border-gray-400 text-gray-400';
    }
  };

  const isUrgent = (task: any) => {
    if (!task.limitDate) return false;
    const today = new Date();
    const daysDiff = Math.ceil((task.limitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 2;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-purple-400/50 transition-colors cursor-grab active:cursor-grabbing"
      onClick={(e) => {
        // Only trigger click if not dragging
        if (!isDragging && e.target === e.currentTarget) {
          onTaskClick(task);
        }
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-white font-medium flex-1">{task.title}</h4>
        <div className="flex items-center gap-2 ml-2">
          {isUrgent(task) && (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
      </div>
      
      {task.description && (
        <p className="text-slate-400 text-sm mb-3">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {task.complexity && (
            <Badge variant="outline" className={getComplexityColor(task.complexity)}>
              {task.complexity}
            </Badge>
          )}
          {task.estimatedTime && (
            <span className="text-slate-500">{task.estimatedTime}h</span>
          )}
        </div>
        
        {task.limitDate && (
          <div className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3 h-3" />
            {task.limitDate.toLocaleDateString()}
          </div>
        )}
      </div>
      
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function BacklogCard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { tasks, updateTask, deleteTask } = useTaskContext();

  const { setNodeRef } = useDroppable({
    id: 'BACKLOG',
  });

  const backlogTasks = tasks.filter(task => task.status === 'BACKLOG');

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

  // Sort tasks: ASAP first, then urgent (within 2 days), then by priority
  const sortedTasks = [...backlogTasks].sort((a, b) => {
    if (a.priority === 'ASAP' && b.priority !== 'ASAP') return -1;
    if (b.priority === 'ASAP' && a.priority !== 'ASAP') return 1;
    
    const isUrgent = (task: any) => {
      if (!task.limitDate) return false;
      const today = new Date();
      const daysDiff = Math.ceil((task.limitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 2;
    };
    
    const aUrgent = isUrgent(a);
    const bUrgent = isUrgent(b);
    
    if (aUrgent && !bUrgent) return -1;
    if (bUrgent && !aUrgent) return 1;
    
    const priorityOrder = { 'ASAP': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <>
      <Card className="bg-slate-800/50 border-purple-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-purple-400">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Mission Backlog
              <Badge variant="outline" className="border-purple-400 text-purple-400">
                {sortedTasks.length}
              </Badge>
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={setNodeRef}
            className="space-y-3 max-h-96 overflow-y-auto min-h-[200px] p-2 rounded-lg bg-slate-800/20 border-2 border-dashed border-purple-400/30"
          >
            {sortedTasks.map((task, index) => (
              <div key={task.id}>
                {index > 0 && sortedTasks[index-1].priority !== task.priority && (
                  <Separator className="my-2 bg-slate-600" />
                )}
                <TaskItem task={task} onTaskClick={handleTaskClick} />
              </div>
            ))}
            {sortedTasks.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                <Archive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No tasks in backlog</p>
                <p className="text-xs">Drop tasks here or create new ones</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateTaskModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />

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