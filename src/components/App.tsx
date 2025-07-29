import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Play, Pause, Settings, Plus, Target, Calendar, Clock, BookOpen, CheckSquare, Square, ArrowRight, LogOut, User, Shield } from 'lucide-react';
import { ObjectivesCard } from './ObjectivesCard';
import { BacklogCard } from './BacklogCard';
import { NotesCard } from './NotesCard';
import { TodayTasksCard } from './TodayTasksCard';
import { DoingTasksCard } from './DoingTasksCard';
import { CompletedTasksCard } from './CompletedTasksCard';
import { TomorrowTasksCard } from './TomorrowTasksCard';
import { MeetingsCard } from './MeetingsCard';
import { RoutineCard } from './RoutineCard';
import { PomodoroTimer } from './PomodoroTimer';
import { SettingsModal } from './SettingsModal';
import { StartDayModal } from './StartDayModal';
import { EndDayModal } from './EndDayModal';
import { TaskDragDropProvider } from './DragDropContext';
import { ObjectiveProvider, useObjectiveContext } from './ObjectiveContext';
import { useAuth } from './AuthContext';

function MainApp() {
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

  const { getObjectiveStats } = useObjectiveContext();
  const { user, logout } = useAuth();
  const objectiveStats = getObjectiveStats();

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
          
          <div className="flex items-center gap-3">
            {/* User Badge */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/70 border border-cyan-400/30 rounded-lg backdrop-blur">
                <Shield className="w-4 h-4 text-green-400" />
                <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
                  <User className="w-3 h-3 mr-1" />
                  {user.username}
                </Badge>
              </div>
            )}
            
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
            
            {/* Logout Button */}
            {user && (
              <Button
                variant="outline"
                onClick={logout}
                className="border-red-400/50 text-red-400 hover:bg-red-400/10 hover:text-red-300"
                title="Disconnect Neural Link"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

          <Card className="p-4 bg-slate-800/50 border-cyan-400/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400">Monthly Objectives</span>
            </div>
            <Progress 
              value={objectiveStats.totalThisMonth > 0 ? (objectiveStats.achievedThisMonth / objectiveStats.totalThisMonth) * 100 : 0} 
              className="h-2 bg-slate-700" 
            />
            <p className="text-xs text-slate-400 mt-1">
              {objectiveStats.achievedThisMonth}/{objectiveStats.totalThisMonth} achieved this month
            </p>
          </Card>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Strategic */}
        <div className="lg:col-span-1 space-y-6">
          <BacklogCard />
          <ObjectivesCard />
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
          <RoutineCard />
        </div>

        {/* Right Column - Timer & Briefings */}
        <div className="lg:col-span-1 space-y-6">
          <PomodoroTimer />
          <MeetingsCard />
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

export default function App() {
  return (
    <ObjectiveProvider>
      <TaskDragDropProvider>
        <MainApp />
      </TaskDragDropProvider>
    </ObjectiveProvider>
  );
} 