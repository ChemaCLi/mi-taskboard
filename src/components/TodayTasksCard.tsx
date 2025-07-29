import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckSquare, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMissionData } from './MissionDataContext';
import { useModals } from './ModalsContext';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    description?: string;
    priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
    timeNeeded?: number;
    limitDate?: string;
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
      case 'ASAP': return 'border-red-400 text-red-400';
      case 'HIGH': return 'border-orange-400 text-orange-400';
      case 'MEDIUM': return 'border-yellow-400 text-yellow-400';
      case 'LOW': return 'border-green-400 text-green-400';
      default: return 'border-slate-400 text-slate-400';
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    onTaskClick(task);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-slate-700/50 rounded border border-slate-600 hover:border-green-400/50 transition-colors cursor-grab active:cursor-grabbing"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 
            className="text-white font-medium text-sm flex-1 cursor-pointer hover:text-green-400 transition-colors"
            onClick={handleTitleClick}
          >
            {task.title}
          </h4>
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

export function TodayTasksCard() {
  const missionData = useMissionData();
  const modals = useModals();

  const { setNodeRef } = useDroppable({
    id: 'TODAY',
  });

  // Get tasks and filter for TODAY status
  const allTasks = missionData.tasks.get();
  const todayTasks = useMemo(() => 
    allTasks.filter(task => task.status === 'TODAY'), 
    [allTasks]
  );

  const handleTaskClick = (task: any) => {
    // Use the centralized modal system to show task details
    modals.tasks.showDetail(task.id, task);
  };

  // Show loading state
  if (missionData.tasks.isLoading) {
    return (
      <Card className="bg-slate-800/50 border-green-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <CheckSquare className="w-5 h-5" />
            Today's Mission
            <Badge variant="outline" className="border-green-400 text-green-400">
              <Loader2 className="w-3 h-3 animate-spin" />
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto min-h-[150px] p-2 rounded-lg bg-slate-800/20 border-2 border-dashed border-green-400/30">
            <div className="text-center text-slate-500 py-6">
              <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
              <p>Loading today's tasks...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (missionData.tasks.error) {
    return (
      <Card className="bg-slate-800/50 border-green-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <CheckSquare className="w-5 h-5" />
            Today's Mission
            <Badge variant="outline" className="border-red-400 text-red-400">
              <AlertTriangle className="w-3 h-3" />
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto min-h-[150px] p-2 rounded-lg bg-slate-800/20 border-2 border-dashed border-green-400/30">
            <div className="text-center text-slate-500 py-6">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-400" />
              <p>Error loading tasks</p>
              <p className="text-xs text-slate-400">{missionData.tasks.error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-green-400/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-400">
          <CheckSquare className="w-5 h-5" />
          Today's Mission
          <Badge variant="outline" className="border-green-400 text-green-400">
            {todayTasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className="space-y-2 max-h-48 overflow-y-auto min-h-[150px] p-2 rounded-lg bg-slate-800/20 border-2 border-dashed border-green-400/30"
        >
          {todayTasks.map((task) => (
            <TaskItem key={task.id} task={task} onTaskClick={handleTaskClick} />
          ))}
          {todayTasks.length === 0 && (
            <div className="text-center text-slate-500 py-6">
              <CheckSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>No tasks for today</p>
              <p className="text-xs">Drop tasks here to work on today</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}