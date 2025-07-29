import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Bell, Save, Trash2, Clock, AlertCircle } from 'lucide-react';

interface Reminder {
  id: string;
  text: string;
  date: Date | string;
  isNear: boolean;
  alertEnabled: boolean;
  alertMinutes: number;
  completed: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface ReminderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder: Reminder | null;
  onSave?: (reminder: Reminder) => void;
  onDelete?: (reminderId: string) => void;
}

export function ReminderDetailModal({ open, onOpenChange, reminder, onSave, onDelete }: ReminderDetailModalProps) {
  const [formData, setFormData] = useState<Reminder>(() => 
    reminder || {
      id: '',
      text: '',
      date: new Date(),
      isNear: false,
      alertEnabled: true,
      alertMinutes: 60,
      completed: false
    }
  );

  const [selectedTime, setSelectedTime] = useState(() => {
    if (reminder?.date) {
      const date = new Date(reminder.date); // Convert string to Date if needed
      return {
        hours: date.getHours().toString().padStart(2, '0'),
        minutes: date.getMinutes().toString().padStart(2, '0')
      };
    }
    return { hours: '09', minutes: '00' };
  });

  React.useEffect(() => {
    if (reminder) {
      // Convert string dates to Date objects if needed
      const updatedReminder = {
        ...reminder,
        date: reminder.date ? (typeof reminder.date === 'string' ? new Date(reminder.date) : reminder.date) : new Date(),
      };
      setFormData(updatedReminder);
      
      const date = new Date(reminder.date); // Convert string to Date if needed
      setSelectedTime({
        hours: date.getHours().toString().padStart(2, '0'),
        minutes: date.getMinutes().toString().padStart(2, '0')
      });
    }
  }, [reminder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const newDate = new Date(formData.date);
    newDate.setHours(parseInt(selectedTime.hours), parseInt(selectedTime.minutes), 0, 0);
    
    const finalData = {
      ...formData,
      date: newDate.toISOString(), // Convert back to ISO string for API
      isNear: isReminderNear(newDate)
    };
    
    if (onSave) {
      onSave(finalData);
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete && reminder) {
      onDelete(reminder.id);
    }
    onOpenChange(false);
  };

  const isReminderNear = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 7; // Consider "near" if within a week
  };

  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getUrgencyColor = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (diff < 0) return 'border-red-600 text-red-400'; // Overdue
    if (hours <= 24) return 'border-orange-400 text-orange-400'; // Within 24 hours
    if (hours <= 168) return 'border-yellow-400 text-yellow-400'; // Within a week
    return 'border-green-400 text-green-400'; // More than a week
  };

  if (!open) return null;

  const formDate = new Date(formData.date); // Ensure it's a Date object
  const timeUntil = getTimeUntil(formDate);
  const urgencyColor = getUrgencyColor(formDate);
  const isOverdue = formDate.getTime() < new Date().getTime();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-600 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            {reminder ? 'Edit Reminder' : 'Reminder Details'}
            {formData.completed && (
              <Badge variant="outline" className="border-green-400 text-green-400">
                Completed
              </Badge>
            )}
            {isOverdue && !formData.completed && (
              <Badge variant="outline" className="border-red-400 text-red-400">
                <AlertCircle className="w-3 h-3 mr-1" />
                Overdue
              </Badge>
            )}
            <Badge variant="outline" className={urgencyColor}>
              {timeUntil}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="text" className="text-white">Reminder Text</Label>
            <Textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              placeholder="What do you need to be reminded about?"
              className="bg-slate-800 border-slate-600 text-white"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-white">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? new Date(formData.date).toLocaleDateString() : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600">
                <Calendar
                  mode="single"
                  selected={new Date(formData.date)}
                  onSelect={(date) => setFormData({...formData, date: date || new Date()})}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-white">Time</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                max="23"
                value={selectedTime.hours}
                onChange={(e) => setSelectedTime({...selectedTime, hours: e.target.value.padStart(2, '0')})}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="HH"
              />
              <span className="text-white self-center">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                value={selectedTime.minutes}
                onChange={(e) => setSelectedTime({...selectedTime, minutes: e.target.value.padStart(2, '0')})}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="MM"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="alertEnabled"
                checked={formData.alertEnabled}
                onChange={(e) => setFormData({...formData, alertEnabled: e.target.checked})}
                className="rounded bg-slate-800 border-slate-600"
              />
              <Label htmlFor="alertEnabled" className="text-white">Enable alert notification</Label>
            </div>

            {formData.alertEnabled && (
              <div>
                <Label htmlFor="alertMinutes" className="text-white">Alert Time (minutes before)</Label>
                <Input
                  id="alertMinutes"
                  type="number"
                  min="1"
                  value={formData.alertMinutes}
                  onChange={(e) => setFormData({...formData, alertMinutes: Number(e.target.value)})}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="5"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="completed"
                checked={formData.completed}
                onChange={(e) => setFormData({...formData, completed: e.target.checked})}
                className="rounded bg-slate-800 border-slate-600"
              />
              <Label htmlFor="completed" className="text-white">Mark as completed</Label>
            </div>

          <div className="flex justify-between">
            <div>
              {reminder && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Reminder
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Reminder
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 