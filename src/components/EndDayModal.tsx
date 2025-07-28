import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Trophy, Target, Clock, TrendingUp, ArrowRight } from 'lucide-react';

interface EndDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEndDay: () => void;
  stats: {
    completedTasks: number;
    totalTasks: number;
    completedPomodoros: number;
    targetPomodoros: number;
  };
}

export function EndDayModal({ open, onOpenChange, onEndDay, stats }: EndDayModalProps) {
  const completionRate = (stats.completedTasks / stats.totalTasks) * 100;
  const pomodoroRate = (stats.completedPomodoros / stats.targetPomodoros) * 100;
  
  const getGrade = (rate: number) => {
    if (rate >= 90) return { grade: 'S', color: 'text-yellow-400', xp: 150 };
    if (rate >= 80) return { grade: 'A', color: 'text-green-400', xp: 120 };
    if (rate >= 70) return { grade: 'B', color: 'text-blue-400', xp: 100 };
    if (rate >= 60) return { grade: 'C', color: 'text-orange-400', xp: 80 };
    return { grade: 'D', color: 'text-red-400', xp: 50 };
  };

  const taskGrade = getGrade(completionRate);
  const pomodoroGrade = getGrade(pomodoroRate);
  const totalXP = taskGrade.xp + pomodoroGrade.xp;

  const handleEndMission = () => {
    onEndDay();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Mission Complete - Performance Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Overall Performance */}
          <Card className="bg-slate-800/50 border-yellow-400/30">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">+{totalXP} XP</div>
                <div className="text-white mb-4">Experience Points Earned</div>
                <div className="flex justify-center gap-4">
                  <Badge className={`${taskGrade.color} text-lg px-3 py-1`}>
                    Tasks: {taskGrade.grade}
                  </Badge>
                  <Badge className={`${pomodoroGrade.color} text-lg px-3 py-1`}>
                    Focus: {pomodoroGrade.grade}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-green-400/30">
              <CardContent className="p-4">
                <h3 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Task Completion
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Completed</span>
                    <span className="text-white">{stats.completedTasks}/{stats.totalTasks}</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                  <div className="text-center text-lg font-bold text-white">
                    {completionRate.toFixed(0)}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-400/30">
              <CardContent className="p-4">
                <h3 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Focus Sessions
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Completed</span>
                    <span className="text-white">{stats.completedPomodoros}/{stats.targetPomodoros}</span>
                  </div>
                  <Progress value={pomodoroRate} className="h-2" />
                  <div className="text-center text-lg font-bold text-white">
                    {pomodoroRate.toFixed(0)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Insights */}
          <Card className="bg-slate-800/50 border-blue-400/30">
            <CardContent className="p-4">
              <h3 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Weekly Performance Insights
              </h3>
              <div className="text-sm text-slate-300 space-y-1">
                <p>• Today's performance: Above average for Monday (+12%)</p>
                <p>• Weekly progress: 22/30 tasks completed (73%)</p>
                <p>• Improvement: +8% from last week</p>
                <p>• Tomorrow's recommendation: 5-6 tasks based on capacity</p>
              </div>
            </CardContent>
          </Card>

          {/* Incomplete Tasks */}
          {stats.totalTasks - stats.completedTasks > 0 && (
            <Card className="bg-slate-800/50 border-orange-400/30">
              <CardContent className="p-4">
                <h3 className="text-orange-400 font-medium mb-3">Tasks Moving Forward</h3>
                <div className="text-sm text-slate-300">
                  <p>{stats.totalTasks - stats.completedTasks} incomplete tasks will be moved to tomorrow's queue.</p>
                  <p className="text-slate-400 mt-1">These will be prioritized in your next mission briefing.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button 
              onClick={handleEndMission}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Complete Mission
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}