import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckSquare, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  estimatedTime: number;
  priority: 'ASAP' | 'High' | 'Medium' | 'Low';
  completed: boolean;
}

export function TodayTasksCard() {
  const todayTasks: Task[] = [
    {
      id: '1',
      title: 'Review pull requests',
      estimatedTime: 1,
      priority: 'High',
      completed: false
    },
    {
      id: '2',
      title: 'Update documentation',
      estimatedTime: 2,
      priority: 'Medium',
      completed: false
    },
    {
      id: '3',
      title: 'Team standup meeting',
      estimatedTime: 0.5,
      priority: 'High',
      completed: true
    }
  ];

  const activeTasks = todayTasks.filter(task => !task.completed);

  return (
    <Card className="bg-slate-800/50 border-green-400/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-400">
          <CheckSquare className="w-5 h-5" />
          Today's Mission
          <Badge variant="outline" className="border-green-400 text-green-400">
            {activeTasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {activeTasks.map((task) => (
            <div key={task.id} className="p-2 bg-slate-700/50 rounded border border-slate-600 hover:border-green-400/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">{task.title}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{task.estimatedTime}h</span>
                  </div>
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}