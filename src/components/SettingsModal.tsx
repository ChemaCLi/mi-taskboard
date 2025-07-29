import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Settings, Clock, Bell, Database, Calendar, Loader2 } from 'lucide-react';
import { useMissionData } from './MissionDataContext';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SettingsData {
  startHour: number;
  endHour: number;
  lunchStart: number;
  lunchEnd: number;
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  meetingAlert: number;
  audioEnabled: boolean;
  audioVolume: number;
  pomodoroSounds: boolean;
  notificationSounds: boolean;
  uiSounds: boolean;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const missionData = useMissionData();
  const settings = missionData.settings.get()[0]; // Get the first (and only) settings object
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [workSchedule, setWorkSchedule] = useState({
    workStart: 9,
    workEnd: 18,
    lunchStart: 13,
    lunchEnd: 14
  });

  const [pomodoroSettings, setPomodoroSettings] = useState({
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15
  });

  const [notifications, setNotifications] = useState({
    meetingAlert: 5,
    reminderAlert: 60
  });

  const [audioSettings, setAudioSettings] = useState({
    audioEnabled: true,
    audioVolume: 0.5,
    pomodoroSounds: true,
    notificationSounds: true,
    uiSounds: false
  });

  // Load settings when modal opens or settings change
  useEffect(() => {
    if (open && settings) {
      setWorkSchedule({
        workStart: settings.startHour,
        workEnd: settings.endHour,
        lunchStart: settings.lunchStart,
        lunchEnd: settings.lunchEnd
      });
      
      setPomodoroSettings({
        workDuration: settings.workDuration,
        shortBreak: settings.shortBreak,
        longBreak: settings.longBreak
      });
      
      setNotifications({
        meetingAlert: settings.meetingAlert,
        reminderAlert: 60 // Default value as it's not in the schema yet
      });

      setAudioSettings({
        audioEnabled: settings.audioEnabled ?? true,
        audioVolume: settings.audioVolume ?? 0.5,
        pomodoroSounds: settings.pomodoroSounds ?? true,
        notificationSounds: settings.notificationSounds ?? true,
        uiSounds: settings.uiSounds ?? false
      });
    }
  }, [open, settings]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const settingsData = {
        startHour: workSchedule.workStart,
        endHour: workSchedule.workEnd,
        lunchStart: workSchedule.lunchStart,
        lunchEnd: workSchedule.lunchEnd,
        workDuration: pomodoroSettings.workDuration,
        shortBreak: pomodoroSettings.shortBreak,
        longBreak: pomodoroSettings.longBreak,
        meetingAlert: notifications.meetingAlert,
        audioEnabled: audioSettings.audioEnabled,
        audioVolume: audioSettings.audioVolume,
        pomodoroSounds: audioSettings.pomodoroSounds,
        notificationSounds: audioSettings.notificationSounds,
        uiSounds: audioSettings.uiSounds
      };

      // Use the settings manager to update
      const updatedSettings = await missionData.settings.update(settings?.id || 'new', settingsData);
      
      if (updatedSettings) {
        onOpenChange(false);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state if settings are still loading
  if (missionData.settings.isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-600">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="ml-2 text-white">Loading settings...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="schedule" className="text-white">Schedule</TabsTrigger>
            <TabsTrigger value="pomodoro" className="text-white">Pomodoro</TabsTrigger>
            <TabsTrigger value="notifications" className="text-white">Alerts</TabsTrigger>
            <TabsTrigger value="audio" className="text-white">Audio</TabsTrigger>
            <TabsTrigger value="data" className="text-white">Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="text-white font-medium">Work Schedule</h3>
            </div>
            
            <div>
              <Label className="text-white">Work Start Time</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={workSchedule.workStart}
                onChange={(e) => setWorkSchedule({...workSchedule, workStart: parseInt(e.target.value)})}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-white">Work End Time</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={workSchedule.workEnd}
                onChange={(e) => setWorkSchedule({...workSchedule, workEnd: parseInt(e.target.value)})}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-white">Lunch Start Time</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={workSchedule.lunchStart}
                onChange={(e) => setWorkSchedule({...workSchedule, lunchStart: parseInt(e.target.value)})}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-white">Lunch End Time</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={workSchedule.lunchEnd}
                onChange={(e) => setWorkSchedule({...workSchedule, lunchEnd: parseInt(e.target.value)})}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="pomodoro" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-orange-400" />
              <h3 className="text-white font-medium">Pomodoro Timers (minutes)</h3>
            </div>
            
            <div>
              <Label className="text-white">Work Session</Label>
              <Input
                type="number"
                min="1"
                max="60"
                value={pomodoroSettings.workDuration}
                onChange={(e) => setPomodoroSettings({...pomodoroSettings, workDuration: parseInt(e.target.value)})}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-white">Short Break</Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={pomodoroSettings.shortBreak}
                onChange={(e) => setPomodoroSettings({...pomodoroSettings, shortBreak: parseInt(e.target.value)})}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-white">Long Break</Label>
              <Input
                type="number"
                min="1"
                max="60"
                value={pomodoroSettings.longBreak}
                onChange={(e) => setPomodoroSettings({...pomodoroSettings, longBreak: parseInt(e.target.value)})}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-yellow-400" />
              <h3 className="text-white font-medium">Alert Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-white">Meeting Alert (minutes before)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={notifications.meetingAlert}
                  onChange={(e) => setNotifications({...notifications, meetingAlert: parseInt(e.target.value)})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Reminder Alert (minutes before)</Label>
                <Input
                  type="number"
                  min="1"
                  max="1440"
                  value={notifications.reminderAlert}
                  onChange={(e) => setNotifications({...notifications, reminderAlert: parseInt(e.target.value)})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-yellow-400" />
              <h3 className="text-white font-medium">Audio Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-white">Enable Audio</Label>
                <input
                  type="checkbox"
                  checked={audioSettings.audioEnabled}
                  onChange={(e) => setAudioSettings({...audioSettings, audioEnabled: e.target.checked})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Audio Volume</Label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={audioSettings.audioVolume}
                  onChange={(e) => setAudioSettings({...audioSettings, audioVolume: parseFloat(e.target.value)})}
                  className="w-full accent-cyan-400"
                />
                <span className="text-slate-400 text-xs">{audioSettings.audioVolume.toFixed(2)}</span>
              </div>
              <div>
                <Label className="text-white">Pomodoro Sounds</Label>
                <input
                  type="checkbox"
                  checked={audioSettings.pomodoroSounds}
                  onChange={(e) => setAudioSettings({...audioSettings, pomodoroSounds: e.target.checked})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Notification Sounds</Label>
                <input
                  type="checkbox"
                  checked={audioSettings.notificationSounds}
                  onChange={(e) => setAudioSettings({...audioSettings, notificationSounds: e.target.checked})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">UI Sounds</Label>
                <input
                  type="checkbox"
                  checked={audioSettings.uiSounds}
                  onChange={(e) => setAudioSettings({...audioSettings, uiSounds: e.target.checked})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-purple-400" />
              <h3 className="text-white font-medium">Data Management</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <h4 className="text-white font-medium mb-2">Storage Locations</h4>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• SQLite: Settings, daily stats, task history</li>
                  <li>• Markdown Files: Virtual notebook entries</li>
                  <li>• Log Files: Daily snapshots and session logs</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="border-purple-400 text-purple-400">
                  Export Data
                </Button>
                <Button variant="outline" className="border-yellow-400 text-yellow-400">
                  Backup Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="bg-slate-600" />
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500 hover:border-slate-400"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-cyan-600 hover:bg-cyan-700"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}