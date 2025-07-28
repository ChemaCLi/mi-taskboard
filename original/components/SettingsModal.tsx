import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Settings, Clock, Bell, Database } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [workSchedule, setWorkSchedule] = useState({
    startHour: 9,
    endHour: 18,
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

  const handleSave = () => {
    // Save settings
    console.log('Saving settings:', { workSchedule, pomodoroSettings, notifications });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="schedule" className="text-white">Schedule</TabsTrigger>
            <TabsTrigger value="pomodoro" className="text-white">Pomodoro</TabsTrigger>
            <TabsTrigger value="notifications" className="text-white">Alerts</TabsTrigger>
            <TabsTrigger value="data" className="text-white">Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-white font-medium">Work Schedule</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Start Hour</Label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={workSchedule.startHour}
                  onChange={(e) => setWorkSchedule({...workSchedule, startHour: parseInt(e.target.value)})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">End Hour</Label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={workSchedule.endHour}
                  onChange={(e) => setWorkSchedule({...workSchedule, endHour: parseInt(e.target.value)})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Lunch Start</Label>
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
                <Label className="text-white">Lunch End</Label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={workSchedule.lunchEnd}
                  onChange={(e) => setWorkSchedule({...workSchedule, lunchEnd: parseInt(e.target.value)})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="pomodoro" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-orange-400" />
              <h3 className="text-white font-medium">Pomodoro Timers (minutes)</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
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
          
          <TabsContent value="data" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-purple-400" />
              <h3 className="text-white font-medium">Data Management</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <h4 className="text-white font-medium mb-2">Storage Locations</h4>
                <ul className="text-slate-400 text-sm space-y-1">
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}