import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  estimatedTime: number;
  priority: 'ASAP' | 'High' | 'Medium' | 'Low';
  reason: 'planned' | 'moved' | 'incomplete';
}

export function TomorrowTasksCard() {
  const tomorrowTasks: Task[] = [
    {
      id: '1',
      title: 'Design new feature wireframes',
      estimatedTime: 3,
      priority: 'High',
      reason: 'planned'
    },
    {
      id: '2',
      title: 'Refactor authentication module',
      estimatedTime: 4,
      priority: 'Medium',
      reason: 'moved'
    }
  ];

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
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {tomorrowTasks.map((task) => (
            <div key={task.id} className="p-2 bg-slate-700/50 rounded border border-slate-600 hover:border-indigo-400/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm">{task.title}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{task.estimatedTime}h</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getReasonColor(task.reason)}`}
                >
                  {getReasonText(task.reason)}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    task.priority === 'ASAP' ? 'border-red-400 text-red-400' :
                    task.priority === 'High' ? 'border-orange-400 text-orange-400' :
                    task.priority === 'Medium' ? 'border-yellow-400 text-yellow-400' :
                    'border-green-400 text-green-400'
                  }`}
                >
                  {task.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}