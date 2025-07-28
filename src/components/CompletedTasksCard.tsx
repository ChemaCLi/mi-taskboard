import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, Trophy } from 'lucide-react';

interface CompletedTask {
  id: string;
  title: string;
  completedAt: Date;
  timeSpent: number;
  priority: 'ASAP' | 'High' | 'Medium' | 'Low';
}

export function CompletedTasksCard() {
  const completedTasks: CompletedTask[] = [
    {
      id: '1',
      title: 'Team standup meeting',
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      timeSpent: 0.5,
      priority: 'High'
    },
    {
      id: '2',
      title: 'Code review for dashboard',
      completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      timeSpent: 1,
      priority: 'Medium'
    },
    {
      id: '3',
      title: 'Update project dependencies',
      completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      timeSpent: 0.5,
      priority: 'Low'
    }
  ];

  const totalXP = completedTasks.reduce((total, task) => {
    const priorityXP = {
      'ASAP': 100,
      'High': 75,
      'Medium': 50,
      'Low': 25
    };
    return total + priorityXP[task.priority];
  }, 0);

  return (
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
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {completedTasks.map((task) => (
            <div key={task.id} className="p-2 bg-emerald-400/10 rounded border border-emerald-400/30">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">{task.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{task.timeSpent}h</span>
                  <Badge 
                    variant="outline" 
                    className="text-xs border-emerald-400 text-emerald-400"
                  >
                    ✓
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {task.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}