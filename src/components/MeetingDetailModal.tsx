import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Calendar as CalendarIcon2, Users, Save, Trash2, Clock, AlertCircle, MapPin, Loader2 } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  datetime: Date | string;
  duration?: number;
  alertEnabled: boolean;
  alertMinutes: number;
  completed: boolean;
  participants?: string[];
  location?: string;
  type?: 'standup' | 'review' | 'planning' | 'other';
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface MeetingDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting | null;
  onSave?: (meeting: Meeting) => void;
  onDelete?: (meetingId: string) => void;
}

export function MeetingDetailModal({ open, onOpenChange, meeting, onSave, onDelete }: MeetingDetailModalProps) {
  const [formData, setFormData] = useState<Meeting>(() => 
    meeting || {
      id: '',
      title: '',
      description: '',
      datetime: new Date(),
      duration: 30,
      alertEnabled: true,
      alertMinutes: 5,
      completed: false,
      participants: [],
      location: '',
      type: 'other'
    }
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTime, setSelectedTime] = useState(() => {
    if (meeting?.datetime) {
      const date = new Date(meeting.datetime); // Convert string to Date if needed
      return {
        hours: date.getHours().toString().padStart(2, '0'),
        minutes: date.getMinutes().toString().padStart(2, '0')
      };
    }
    return { hours: '09', minutes: '00' };
  });

  const [newParticipant, setNewParticipant] = useState('');

  React.useEffect(() => {
    if (meeting) {
      // Convert string dates to Date objects if needed
      const updatedMeeting = {
        ...meeting,
        datetime: meeting.datetime ? (typeof meeting.datetime === 'string' ? new Date(meeting.datetime) : meeting.datetime) : new Date(),
      };
      setFormData(updatedMeeting);
      
      const date = new Date(meeting.datetime); // Convert string to Date if needed
      setSelectedTime({
        hours: date.getHours().toString().padStart(2, '0'),
        minutes: date.getMinutes().toString().padStart(2, '0')
      });
      setError(null);
    }
  }, [meeting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Meeting title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Combine date and time
      const newDate = new Date(formData.datetime);
      newDate.setHours(parseInt(selectedTime.hours), parseInt(selectedTime.minutes), 0, 0);
      
      const finalData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        datetime: newDate.toISOString(), // Convert back to ISO string for API
        location: formData.location?.trim() || '',
        participants: Array.isArray(formData.participants) ? formData.participants : []
      };
      
      if (onSave) {
        await onSave(finalData);
      }
    } catch (error) {
      console.error('Error saving meeting:', error);
      setError('Failed to save meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !meeting) return;

    setIsLoading(true);
    setError(null);

    try {
      await onDelete(meeting.id);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setError('Failed to delete meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addParticipant = () => {
    if (newParticipant.trim() && !formData.participants?.includes(newParticipant.trim())) {
      setFormData({
        ...formData,
        participants: [...(formData.participants || []), newParticipant.trim()]
      });
      setNewParticipant('');
    }
  };

  const removeParticipant = (participantToRemove: string) => {
    setFormData({
      ...formData,
      participants: formData.participants?.filter(participant => participant !== participantToRemove) || []
    });
  };

  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Past';
    
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
    const minutes = diff / (1000 * 60);
    
    if (diff < 0) return 'border-gray-400 text-gray-400'; // Past
    if (minutes <= 5) return 'border-red-400 text-red-400'; // Within 5 minutes
    if (minutes <= 60) return 'border-orange-400 text-orange-400'; // Within 1 hour
    if (minutes <= 1440) return 'border-yellow-400 text-yellow-400'; // Within 24 hours
    return 'border-green-400 text-green-400'; // More than 24 hours
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'standup': return 'border-blue-400 text-blue-400';
      case 'review': return 'border-purple-400 text-purple-400';
      case 'planning': return 'border-green-400 text-green-400';
      default: return 'border-gray-400 text-gray-400';
    }
  };

  const isUpcoming = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return diff > 0 && diff <= 5 * 60 * 1000; // Within 5 minutes
  };

  if (!open) return null;

  const formDate = new Date(formData.datetime); // Ensure it's a Date object
  const timeUntil = getTimeUntil(formDate);
  const urgencyColor = getUrgencyColor(formDate);
  const isStartingSoon = isUpcoming(formDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-600 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            {meeting ? 'Neural Briefing Protocol' : 'Briefing Details'}
            {formData.type && (
              <Badge variant="outline" className={getMeetingTypeColor(formData.type)}>
                {formData.type}
              </Badge>
            )}
            {formData.completed && (
              <Badge variant="outline" className="border-green-400 text-green-400">
                Completed
              </Badge>
            )}
            {isStartingSoon && !formData.completed && (
              <Badge variant="outline" className="border-red-400 text-red-400">
                <AlertCircle className="w-3 h-3 mr-1" />
                Starting Soon!
              </Badge>
            )}
            <Badge variant="outline" className={urgencyColor}>
              {timeUntil}
            </Badge>
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
            <Label htmlFor="title" className="text-white">Briefing Subject</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter briefing subject"
              className="bg-slate-800 border-slate-600 text-white"
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="type" className="text-white">Neural Briefing Protocol</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as any})} disabled={isLoading}>
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
            <Select value={formData.duration?.toString()} onValueChange={(value) => setFormData({...formData, duration: parseInt(value)})} disabled={isLoading}>
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
              value={formData.participants?.join(', ') || ''}
              onChange={(e) => setFormData({...formData, participants: e.target.value.split(',').map(p => p.trim()).filter(Boolean)})}
              placeholder="Enter operative names (comma separated)"
              className="bg-slate-800 border-slate-600 text-white"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="datetime" className="text-white">Neural Link Date & Time</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={formData.datetime instanceof Date ? 
                formData.datetime.toISOString().slice(0, 16) : 
                typeof formData.datetime === 'string' ? 
                  new Date(formData.datetime).toISOString().slice(0, 16) : 
                  ''
              }
              onChange={(e) => setFormData({...formData, datetime: new Date(e.target.value)})}
              className="bg-slate-800 border-slate-600 text-white"
              disabled={isLoading}
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
              disabled={isLoading}
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
                disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Terminating...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Terminate Briefing
                </>
              )}
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-600 text-white hover:bg-slate-700"
                disabled={isLoading}
              >
                Abort
              </Button>
              <Button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing Neural Data...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Protocol
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 