import React, { useState, useEffect } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Play, Pause, Settings, Plus, Target, Calendar, Clock, BookOpen, CheckSquare, Square, ArrowRight } from 'lucide-react';
import { ObjectivesCard } from './components/ObjectivesCard';
import { BacklogCard } from './components/BacklogCard';
import { NotesCard } from './components/NotesCard';
import { TodayTasksCard } from './components/TodayTasksCard';
import { DoingTasksCard } from './components/DoingTasksCard';
import { CompletedTasksCard } from './components/CompletedTasksCard';
import { TomorrowTasksCard } from './components/TomorrowTasksCard';
import { MeetingsCard } from './components/MeetingsCard';
import { PomodoroTimer } from './components/PomodoroTimer';
import { SettingsModal } from './components/SettingsModal';
import { StartDayModal } from './components/StartDayModal';
import { EndDayModal } from './components/EndDayModal';

export default function App() {
  const [dayStarted, setDayStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStartDay, setShowStartDay] = useState(false);
  const [showEndDay, setShowEndDay] = useState(false);
  const [workProgress, setWorkProgress] = useState(25); // Mock progress
  const [dailyStats, setDailyStats] = useState({
    completedTasks: 3,
    totalTasks: 8,
    completedPomodoros: 4,
    targetPomodoros: 8
  });

  // Mock work schedule
  const workSchedule = {
    startHour: 9,
    endHour: 18,
    lunchStart: 13,
    lunchEnd: 14
  };

  const getCurrentTimeProgress = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour < workSchedule.startHour) return 0;
    if (currentHour >= workSchedule.endHour) return 100;
    
    const totalMinutes = (workSchedule.endHour - workSchedule.startHour) * 60;
    const lunchMinutes = (workSchedule.lunchEnd - workSchedule.lunchStart) * 60;
    const workMinutes = totalMinutes - lunchMinutes;
    
    const elapsedMinutes = (currentHour - workSchedule.startHour) * 60 + currentMinute;
    return Math.min((elapsedMinutes / workMinutes) * 100, 100);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkProgress(getCurrentTimeProgress());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Gaming Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-bold text-white">Mission Control</h1>
            </div>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
              Level {Math.floor(dailyStats.completedTasks * 2.5)} Operator
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {!dayStarted && (
              <Button 
                onClick={() => setShowStartDay(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Mission
              </Button>
            )}
            {dayStarted && (
              <Button 
                onClick={() => setShowEndDay(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                End Mission
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => setShowSettings(true)}
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="p-4 bg-slate-800/50 border-cyan-400/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400">Mission Progress</span>
            </div>
            <Progress value={workProgress} className="h-2 bg-slate-700" />
            <p className="text-xs text-slate-400 mt-1">{workProgress.toFixed(0)}% of workday completed</p>
          </Card>
          
          <Card className="p-4 bg-slate-800/50 border-green-400/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Tasks Completed</span>
            </div>
            <Progress value={(dailyStats.completedTasks / dailyStats.totalTasks) * 100} className="h-2 bg-slate-700" />
            <p className="text-xs text-slate-400 mt-1">{dailyStats.completedTasks}/{dailyStats.totalTasks} objectives</p>
          </Card>
          
          <Card className="p-4 bg-slate-800/50 border-purple-400/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400">Focus Sessions</span>
            </div>
            <Progress value={(dailyStats.completedPomodoros / dailyStats.targetPomodoros) * 100} className="h-2 bg-slate-700" />
            <p className="text-xs text-slate-400 mt-1">{dailyStats.completedPomodoros}/{dailyStats.targetPomodoros} pomodoros</p>
          </Card>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Strategic */}
        <div className="lg:col-span-1 space-y-6">
          <ObjectivesCard />
          <MeetingsCard />
        </div>

        {/* Center Column - Operational */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TodayTasksCard />
            <DoingTasksCard />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CompletedTasksCard />
            <TomorrowTasksCard />
          </div>
          <NotesCard />
        </div>

        {/* Right Column - Backlog & Timer */}
        <div className="lg:col-span-1 space-y-6">
          <PomodoroTimer />
          <BacklogCard />
        </div>
      </div>

      {/* Modals */}
      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
      <StartDayModal open={showStartDay} onOpenChange={setShowStartDay} onStartDay={() => setDayStarted(true)} />
      <EndDayModal 
        open={showEndDay} 
        onOpenChange={setShowEndDay} 
        onEndDay={() => setDayStarted(false)}
        stats={dailyStats}
      />
    </div>
  );
}