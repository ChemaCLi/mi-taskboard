import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, Archive, Calendar, AlertTriangle } from 'lucide-react';
import { CreateTaskModal } from './CreateTaskModal';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'ASAP' | 'High' | 'Medium' | 'Low';
  limitDate?: Date;
  estimatedTime: number; // in hours
  complexity: 'Simple' | 'Moderate' | 'Complex';
  tags: string[];
}

export function BacklogCard() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Fix critical login bug',
      description: 'Users cant login with Google OAuth',
      priority: 'ASAP',
      limitDate: new Date('2025-01-29'),
      estimatedTime: 2,
      complexity: 'Moderate',
      tags: ['bug', 'auth', 'critical']
    },
    {
      id: '2',
      title: 'Update user profile API',
      description: 'Add new fields for user preferences',
      priority: 'High',
      limitDate: new Date('2025-01-30'),
      estimatedTime: 4,
      complexity: 'Moderate',
      tags: ['api', 'backend']
    },
    {
      id: '3',
      title: 'Design new landing page',
      description: 'Create mockups for the new marketing page',
      priority: 'Medium',
      limitDate: new Date('2025-02-15'),
      estimatedTime: 8,
      complexity: 'Complex',
      tags: ['design', 'marketing']
    },
    {
      id: '4',
      title: 'Write unit tests for components',
      description: 'Add test coverage for React components',
      priority: 'Low',
      estimatedTime: 6,
      complexity: 'Simple',
      tags: ['testing', 'frontend']
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ASAP': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-600 text-white';
      case 'Medium': return 'bg-yellow-600 text-black';
      case 'Low': return 'bg-green-600 text-white';
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

  const isUrgent = (task: Task) => {
    if (!task.limitDate) return false;
    const today = new Date();
    const daysDiff = Math.ceil((task.limitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 2;
  };

  // Sort tasks: ASAP first, then urgent (within 2 days), then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.priority === 'ASAP' && b.priority !== 'ASAP') return -1;
    if (b.priority === 'ASAP' && a.priority !== 'ASAP') return 1;
    
    const aUrgent = isUrgent(a);
    const bUrgent = isUrgent(b);
    
    if (aUrgent && !bUrgent) return -1;
    if (bUrgent && !aUrgent) return 1;
    
    const priorityOrder = { 'ASAP': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
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
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedTasks.map((task, index) => (
              <div key={task.id} className="relative">
                {index > 0 && sortedTasks[index-1].priority !== task.priority && (
                  <Separator className="my-2 bg-slate-600" />
                )}
                
                <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-purple-400/50 transition-colors cursor-pointer">
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
                  
                  <p className="text-slate-400 text-sm mb-3">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getComplexityColor(task.complexity)}>
                        {task.complexity}
                      </Badge>
                      <span className="text-slate-500">{task.estimatedTime}h</span>
                    </div>
                    
                    {task.limitDate && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {task.limitDate.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateTaskModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </>
  );
}