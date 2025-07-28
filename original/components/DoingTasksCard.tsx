import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Play, Clock } from 'lucide-react';

interface ActiveTask {
  id: string;
  title: string;
  startTime: Date;
  estimatedTime: number;
  progress: number;
}

export function DoingTasksCard() {
  const activeTasks: ActiveTask[] = [
    {
      id: '1',
      title: 'Implementing user authentication',
      startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      estimatedTime: 2,
      progress: 60
    }
  ];

  const getElapsedTime = (startTime: Date) => {
    const elapsed = Date.now() - startTime.getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  return (
    <Card className="bg-slate-800/50 border-blue-400/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-400">
          <Play className="w-5 h-5" />
          In Progress
          <Badge variant="outline" className="border-blue-400 text-blue-400">
            {activeTasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeTasks.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
              No active tasks. Start working on something!
            </p>
          ) : (
            activeTasks.map((task) => {
              const { hours, minutes } = getElapsedTime(task.startTime);
              return (
                <div key={task.id} className="p-3 bg-blue-400/10 rounded-lg border border-blue-400/30">
                  <h4 className="text-white font-medium mb-2">{task.title}</h4>
                  <div className="space-y-2">
                    <Progress value={task.progress} className="h-2 bg-slate-700" />
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-blue-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {hours > 0 ? `${hours}h ` : ''}{minutes}m elapsed
                        </span>
                      </div>
                      <span className="text-slate-400">
                        ~{task.estimatedTime}h estimated
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}