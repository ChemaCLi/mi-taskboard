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
import { CalendarIcon, Calendar as CalendarIcon2, Users, Save, Trash2, Clock, AlertCircle, MapPin } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  datetime: Date;
  duration?: number;
  alertEnabled: boolean;
  alertMinutes: number;
  completed: boolean;
  participants?: string[];
  location?: string;
  type?: 'standup' | 'review' | 'planning' | 'other';
  createdAt?: Date;
  updatedAt?: Date;
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

  const [selectedTime, setSelectedTime] = useState(() => {
    if (meeting?.datetime) {
      const date = meeting.datetime;
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
      setFormData(meeting);
      const date = meeting.datetime;
      setSelectedTime({
        hours: date.getHours().toString().padStart(2, '0'),
        minutes: date.getMinutes().toString().padStart(2, '0')
      });
    }
  }, [meeting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const newDate = new Date(formData.datetime);
    newDate.setHours(parseInt(selectedTime.hours), parseInt(selectedTime.minutes), 0, 0);
    
    const finalData = {
      ...formData,
      datetime: newDate
    };
    
    if (onSave) {
      onSave(finalData);
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete && meeting) {
      onDelete(meeting.id);
    }
    onOpenChange(false);
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

  const timeUntil = getTimeUntil(formData.datetime);
  const urgencyColor = getUrgencyColor(formData.datetime);
  const isStartingSoon = isUpcoming(formData.datetime);
  const endTime = new Date(formData.datetime.getTime() + (formData.duration || 0) * 60 * 1000);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-600 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CalendarIcon2 className="w-5 h-5 text-pink-400" />
            {meeting ? 'Edit Meeting' : 'Meeting Details'}
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Meeting Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter meeting title..."
                  className="bg-slate-800 border-slate-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Meeting agenda or description..."
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-white">Meeting Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as any})}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="standup">Standup</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration" className="text-white">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-white">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Conference room, Zoom link, etc."
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="date" className="text-white">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.datetime ? formData.datetime.toLocaleDateString() : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                    <Calendar
                      mode="single"
                      selected={formData.datetime}
                      onSelect={(date) => setFormData({...formData, datetime: date || new Date()})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-white">Start Time</Label>
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
                <p className="text-xs text-slate-500 mt-1">
                  End time: {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div>
                <Label className="text-white">Participants</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newParticipant}
                    onChange={(e) => setNewParticipant(e.target.value)}
                    placeholder="Add participant..."
                    className="bg-slate-800 border-slate-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                  />
                  <Button type="button" onClick={addParticipant} variant="outline" className="border-slate-600">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.participants?.map((participant) => (
                    <Badge key={participant} variant="secondary" className="cursor-pointer" onClick={() => removeParticipant(participant)}>
                      <Users className="w-3 h-3 mr-1" />
                      {participant} ×
                    </Badge>
                  ))}
                </div>
              </div>
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
              <Label htmlFor="alertEnabled" className="text-white">Enable meeting alert</Label>
            </div>

            {formData.alertEnabled && (
              <div>
                <Label htmlFor="alertMinutes" className="text-white">Alert me this many minutes before</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="alertMinutes"
                    type="number"
                    min="1"
                    value={formData.alertMinutes}
                    onChange={(e) => setFormData({...formData, alertMinutes: Number(e.target.value)})}
                    className="bg-slate-800 border-slate-600 text-white w-24"
                  />
                  <span className="text-slate-400">minutes</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  You will be alerted at {new Date(formData.datetime.getTime() - formData.alertMinutes * 60 * 1000).toLocaleString()}
                </p>
              </div>
            )}

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
          </div>

          {formData.location && (
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Location:</span>
                <span>{formData.location}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <div>
              {meeting && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Meeting
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
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Meeting
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 