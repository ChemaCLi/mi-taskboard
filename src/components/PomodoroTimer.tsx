import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, Pause, RotateCcw, Settings, Target } from 'lucide-react';
import { WorkSessionModal } from './WorkSessionModal';
import { useMissionData } from './MissionDataContext';
import { audioService } from '../lib/audio';

type SessionType = 'work' | 'rest';
type CycleMode = '3' | '4' | '5';

interface Session {
  type: SessionType;
  duration: number; // in minutes
}

export function PomodoroTimer() {
  const missionData = useMissionData();
  const settings = missionData.settings.get()[0]; // Get the first (and only) settings object
  
  // Don't render until settings are loaded
  if (!settings) {
    return (
      <Card className="bg-slate-800/50 border-yellow-400/30">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-slate-400">Loading timer settings...</div>
        </CardContent>
      </Card>
    );
  }
  
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(settings.workDuration * 60); // Start with work duration
  const [currentSession, setCurrentSession] = useState(0);
  const [cycleMode, setCycleMode] = useState<CycleMode>('3');
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [currentWork, setCurrentWork] = useState('');
  
  // Use settings for durations
  const workDuration = settings.workDuration;
  const shortBreak = settings.shortBreak;
  const longBreak = settings.longBreak;

  // Memoize the cycle to prevent infinite re-renders
  const currentCycle = useMemo(() => {
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
    return cycles[cycleMode];
  }, [cycleMode, workDuration, shortBreak, longBreak]);

  const currentSessionData = currentCycle[currentSession];
  const totalDuration = currentSessionData.duration * 60;
  const progress = ((totalDuration - time) / totalDuration) * 100;

  // Initialize audio service
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioService.initialize();
        if (settings.audioVolume !== undefined) {
          audioService.setVolume(settings.audioVolume);
        }
        if (settings.audioEnabled !== undefined) {
          audioService.setMuted(!settings.audioEnabled);
        }
      } catch (error) {
        console.warn('Audio service initialization failed:', error);
      }
    };

    initAudio();
  }, [settings.audioVolume, settings.audioEnabled]);

  // Update time when session changes (only when currentSession changes, not currentSessionData)
  useEffect(() => {
    console.log('time state setted from the session data', currentCycle[currentSession].duration * 60);
    setTime(currentCycle[currentSession].duration * 60);
  }, [currentSession, currentCycle]);

  // Play sounds based on session changes
  const playSessionSound = (sessionType: SessionType, action: 'start' | 'end') => {
    if (!settings.pomodoroSounds) return;
    
    try {
      if (sessionType === 'work') {
        if (action === 'start') {
          audioService.playSound('workStart');
        } else {
          audioService.playSound('workEnd');
        }
      } else {
        if (action === 'start') {
          audioService.playSound('breakStart');
        } else {
          audioService.playSound('breakEnd');
        }
      }
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    console.log('useState [isActive]')
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && time > 0) {
      interval = setInterval(() => {
        console.log('time', time);
        setTime(prevTime => {
          if (prevTime <= 1) {
            setIsActive(false);
            return 0;
          }
          console.log('lets remove 1 second')
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  console.log('time state', time);

  // Handle session completion
  useEffect(() => {
    if (time === 0 && !isActive) {
      // Play session end sound
      if (currentSessionData) {
        playSessionSound(currentSessionData.type, 'end');
      }
      
      // Move to next session or complete cycle
      if (currentSession < currentCycle.length - 1) {
        setCurrentSession(currentSession + 1);
        const nextSession = currentCycle[currentSession + 1];
        setTime(nextSession.duration * 60);
        
        // If next session is work, always open modal to remind user of their focus
        if (nextSession.type === 'work') {
          setShowWorkModal(true);
        } else {
          // Play next session start sound for rest sessions
          playSessionSound(nextSession.type, 'start');
        }
      } else {
        // Cycle completed
        setCurrentSession(0);
        setTime(currentCycle[0].duration * 60);
        
        // Play cycle complete sound
        if (settings.pomodoroSounds) {
          try {
            audioService.playSound('cycleComplete');
          } catch (error) {
            console.warn('Failed to play cycle complete sound:', error);
          }
        }
        
        // If first session is work, always open modal to remind user of their focus
        if (currentCycle[0].type === 'work') {
          setShowWorkModal(true);
        } else {
          // Play first session start sound for rest sessions
          playSessionSound(currentCycle[0].type, 'start');
        }
      }
    }
  }, [time, isActive, currentSession, currentCycle]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (currentSessionData?.type === 'work' && !isActive) {
      setShowWorkModal(true);
      return;
    }
    
    if (!isActive) {
      // Play session start sound when starting
      if (currentSessionData) {
        playSessionSound(currentSessionData.type, 'start');
      }
    }
    
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(currentSessionData.duration * 60);
    
    // If it's a work session and we have current work, open modal to allow editing
    if (currentSessionData?.type === 'work' && currentWork) {
      setShowWorkModal(true);
    }
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
    
    // Play session start sound when starting from modal
    if (currentSessionData) {
      playSessionSound(currentSessionData.type, 'start');
    }
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
              mode="inverted"
              className={`h-2 mt-3 ${
                currentSessionData?.type === 'work' 
                  ? '[&>*]:bg-yellow-500 bg-yellow-500/20' 
                  : '[&>*]:bg-blue-500 bg-blue-500/20'
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
                      ? 'bg-green-500'
                      : index === currentSession
                      ? 'bg-green-500/50'
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
        existingWork={currentWork}
      />
    </>
  );
}