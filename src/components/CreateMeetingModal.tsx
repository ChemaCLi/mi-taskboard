import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Clock, Loader2, AlertCircle } from 'lucide-react';

interface CreateMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (meetingData: any) => void;
}

export function CreateMeetingModal({ open, onOpenChange, onSave }: CreateMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    participants: '',
    date: undefined as Date | undefined,
    time: '',
    duration: '30',
    location: '',
    type: 'other',
    alertEnabled: true,
    alertMinutes: 5
  });

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Combine date and time
      const [hours, minutes] = formData.time.split(':');
      const datetime = new Date(formData.date);
      datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const meetingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        datetime: datetime.toISOString(),
        duration: parseInt(formData.duration),
        location: formData.location.trim(),
        type: formData.type,
        participants: formData.participants.split(',').map(p => p.trim()).filter(p => p),
        alertEnabled: formData.alertEnabled,
        alertMinutes: formData.alertMinutes,
        completed: false
      };

      if (onSave) {
        await onSave(meetingData);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError('Failed to create meeting. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      participants: '',
      date: undefined,
      time: '',
      duration: '30',
      location: '',
      type: 'other',
      alertEnabled: true,
      alertMinutes: 5
    });
    setError(null);
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-600 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Neural Briefing Protocol
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">Briefing Subject *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter briefing subject..."
              className="bg-slate-800 border-slate-600 text-white"
              required
              disabled={isCreating}
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-white">Mission Brief</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Briefing details and agenda..."
              className="bg-slate-800 border-slate-600 text-white"
              rows={3}
              disabled={isCreating}
            />
          </div>
          
          <div>
            <Label htmlFor="type" className="text-white">Neural Briefing Protocol</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})} disabled={isCreating}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select protocol type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="standup">Daily Sync</SelectItem>
                <SelectItem value="review">Strategic Review</SelectItem>
                <SelectItem value="planning">Mission Planning</SelectItem>
                <SelectItem value="other">Custom Protocol</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="duration" className="text-white">Session Duration</Label>
            <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})} disabled={isCreating}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="15">15 min - Quick Sync</SelectItem>
                <SelectItem value="30">30 min - Standard Brief</SelectItem>
                <SelectItem value="45">45 min - Extended Session</SelectItem>
                <SelectItem value="60">1 hr - Full Briefing</SelectItem>
                <SelectItem value="90">1.5 hr - Strategic Review</SelectItem>
                <SelectItem value="120">2 hr - Deep Dive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="participants" className="text-white">Neural Network Participants</Label>
            <Input
              id="participants"
              value={formData.participants}
              onChange={(e) => setFormData({...formData, participants: e.target.value})}
              placeholder="Enter operative names (comma separated)"
              className="bg-slate-800 border-slate-600 text-white"
              disabled={isCreating}
            />
          </div>
          
          <div>
            <Label htmlFor="date" className="text-white">Neural Link Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                  disabled={isCreating}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? formData.date.toLocaleDateString() : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({...formData, date: date || undefined})}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label htmlFor="time" className="text-white">Sync Time *</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="bg-slate-800 border-slate-600 text-white"
              disabled={isCreating}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="location" className="text-white">Neural Hub Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Enter briefing location or virtual space"
              className="bg-slate-800 border-slate-600 text-white"
              disabled={isCreating}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="alertEnabled"
                checked={formData.alertEnabled}
                onChange={(e) => setFormData({...formData, alertEnabled: e.target.checked})}
                className="rounded bg-slate-800 border-slate-600"
                disabled={isCreating}
              />
              <Label htmlFor="alertEnabled" className="text-white">Enable neural alert</Label>
            </div>
            
            {formData.alertEnabled && (
              <div>
                <Label htmlFor="alertMinutes" className="text-white">Alert Time (minutes before)</Label>
                <Input
                  id="alertMinutes"
                  type="number"
                  value={formData.alertMinutes}
                  onChange={(e) => setFormData({...formData, alertMinutes: parseInt(e.target.value)})}
                  placeholder="5"
                  className="bg-slate-800 border-slate-600 text-white"
                  min="1"
                  max="60"
                  disabled={isCreating}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-white hover:bg-slate-700"
              disabled={isCreating}
            >
              Abort
            </Button>
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initiating Neural Link...
                </>
              ) : (
                'Schedule Briefing'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}