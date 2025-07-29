import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CalendarIcon, Bell, Loader2, Clock, Zap, AlertTriangle } from 'lucide-react';
import { useMissionData } from './MissionDataContext';

interface CreateReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (reminderData: any) => Promise<void>;
}

export function CreateReminderModal({ open, onOpenChange, onSave }: CreateReminderModalProps) {
  const missionData = useMissionData();
  const [formData, setFormData] = useState({
    text: '',
    date: undefined as Date | undefined,
    alertMinutes: 60,
    alertEnabled: true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ 
      text: '', 
      date: undefined,
      alertMinutes: 60,
      alertEnabled: true
    });
    setError(null);
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      console.log('CreateReminderModal: Submitting reminder data', formData);
      
      const reminderData = {
        text: formData.text,
        date: formData.date?.toISOString(),
        alertMinutes: formData.alertMinutes,
        alertEnabled: formData.alertEnabled,
        completed: false,
      };

      console.log('CreateReminderModal: Reminder data for save', reminderData);

      if (onSave) {
        await onSave(reminderData);
      } else {
        const newReminder = await missionData.reminders.create(reminderData);
        if (!newReminder) {
          setError('Failed to create reminder. Please try again.');
        }
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating reminder:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const getAlertIcon = (minutes: number) => {
    if (minutes <= 5) return <AlertTriangle className="w-4 h-4 text-red-400" />;
    if (minutes <= 15) return <Zap className="w-4 h-4 text-orange-400" />;
    if (minutes <= 60) return <Clock className="w-4 h-4 text-yellow-400" />;
    return <Bell className="w-4 h-4 text-green-400" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            🧠 Neural Reminder Protocol
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="text" className="text-yellow-400">Reminder Signal</Label>
            <Input
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              placeholder="What needs to be remembered..."
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              disabled={isCreating}
              required
            />
          </div>

          <div>
            <Label htmlFor="alertMinutes" className="text-yellow-400">Alert Minutes Before</Label>
            <Select value={formData.alertMinutes.toString()} onValueChange={(value) => setFormData({...formData, alertMinutes: parseInt(value)})} disabled={isCreating}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    🚨 5 minutes - Immediate
                  </div>
                </SelectItem>
                <SelectItem value="15">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-400" />
                    ⚡ 15 minutes - Urgent
                  </div>
                </SelectItem>
                <SelectItem value="60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    📋 1 hour - Standard
                  </div>
                </SelectItem>
                <SelectItem value="1440">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-green-400" />
                    🔔 1 day - Early Warning
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-yellow-400">Neural Trigger Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                  disabled={isCreating}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? formData.date.toLocaleDateString() : "Select reminder time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({...formData, date: date})}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Abort
            </Button>
            <Button 
              type="submit" 
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  {getAlertIcon(formData.alertMinutes)}
                  <span className="ml-2">🧠 Activate Reminder</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 