import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, Pause, RotateCcw, Settings, Target } from 'lucide-react';
import { WorkSessionModal } from './WorkSessionModal';
import { useMissionData } from './MissionDataContext';

type SessionType = 'work' | 'rest';
type CycleMode = '3' | '4' | '5';

interface Session {
  type: SessionType;
  duration: number; // in minutes
}

export function PomodoroTimer() {
  const missionData = useMissionData();
  const settings = missionData.settings.get()[0]; // Get the first (and only) settings object
  
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [currentSession, setCurrentSession] = useState(0);
  const [cycleMode, setCycleMode] = useState<CycleMode>('3');
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [currentWork, setCurrentWork] = useState('');
  
  // Use settings if available, otherwise fallback to defaults
  const workDuration = settings?.workDuration || 25;
  const shortBreak = settings?.shortBreak || 5;
  const longBreak = settings?.longBreak || 15;

  const getCycle = (mode: CycleMode): Session[] => {
    const cycles: Record<CycleMode, Session[]> = {
      '3': [
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: shortBreak },
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: shortBreak },
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: longBreak }
      ],
      '4': [
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: shortBreak },
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: shortBreak },
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: shortBreak },
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: longBreak }
      ],
      '5': [
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: shortBreak },
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: shortBreak },
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: shortBreak },
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: shortBreak },
        { type: 'work', duration: workDuration },
        { type: 'rest', duration: longBreak }
      ]
    };
    return cycles[mode];
  };

  const currentCycle = getCycle(cycleMode);
  const currentSessionData = currentCycle[currentSession];
  const totalDuration = currentSessionData ? currentSessionData.duration * 60 : 25 * 60;
  const progress = ((totalDuration - time) / totalDuration) * 100;

  // Update time when settings change
  useEffect(() => {
    if (currentSessionData) {
      setTime(currentSessionData.duration * 60);
    }
  }, [currentSessionData, workDuration, shortBreak, longBreak]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      // Session completed
      setIsActive(false);
      if (currentSession < currentCycle.length - 1) {
        setCurrentSession(currentSession + 1);
        const nextSession = currentCycle[currentSession + 1];
        setTime(nextSession.duration * 60);
      } else {
        // Cycle completed
        setCurrentSession(0);
        setTime(currentCycle[0].duration * 60);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, currentSession, currentCycle]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (currentSessionData?.type === 'work' && !currentWork && !isActive) {
      setShowWorkModal(true);
      return;
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(currentSessionData ? currentSessionData.duration * 60 : 25 * 60);
  };

  const resetCycle = () => {
    setIsActive(false);
    setCurrentSession(0);
    setTime(currentCycle[0].duration * 60);
    setCurrentWork('');
  };

  const handleWorkSessionStart = (workDescription: string) => {
    setCurrentWork(workDescription);
    setIsActive(true);
    setShowWorkModal(false);
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-yellow-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-yellow-400">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Focus Timer
            </div>
            <Select value={cycleMode} onValueChange={(value: CycleMode) => setCycleMode(value)}>
              <SelectTrigger className="w-16 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3x</SelectItem>
                <SelectItem value="4">4x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-white mb-2">
              {formatTime(time)}
            </div>
            <Badge 
              variant="outline" 
              className={`
                ${currentSessionData?.type === 'work' 
                  ? 'border-yellow-400 text-yellow-400' 
                  : 'border-blue-400 text-blue-400'
                }
              `}
            >
              {currentSessionData?.type === 'work' ? 'WORK SESSION' : 'BREAK TIME'}
            </Badge>
            <Progress 
              value={progress} 
              className={`h-2 mt-3 ${
                currentSessionData?.type === 'work' ? 'bg-yellow-600' : 'bg-blue-900'
              }`} 
            />
          </div>

          {/* Current Work */}
          {currentWork && currentSessionData?.type === 'work' && (
            <div className="p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/30">
              <p className="text-yellow-400 text-sm font-medium">Current Focus:</p>
              <p className="text-white text-sm">{currentWork}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-2">
            <Button 
              onClick={handleStart}
              className={`
                ${currentSessionData?.type === 'work' 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
                } text-white
              `}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Cycle Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Cycle Progress</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetCycle}
                className="text-slate-400 hover:text-white"
              >
                Reset Cycle
              </Button>
            </div>
            <div className="flex gap-1">
              {currentCycle.map((session, index) => (
                <div
                  key={index}
                  className={`
                    flex-1 h-2 rounded-sm
                    ${index < currentSession 
                      ? (session.type === 'work' ? 'bg-green-500' : 'bg-blue-400')
                      : index === currentSession
                      ? (session.type === 'work' ? 'bg-green-500/50' : 'bg-blue-400/50')
                      : 'bg-slate-600'
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <WorkSessionModal 
        open={showWorkModal} 
        onOpenChange={setShowWorkModal}
        onStartSession={handleWorkSessionStart}
      />
    </>
  );
}