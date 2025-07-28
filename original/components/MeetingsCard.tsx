import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, Users, AlertCircle, Plus } from 'lucide-react';
import { CreateMeetingModal } from './CreateMeetingModal';

interface Meeting {
  id: string;
  title: string;
  participants: string[];
  startTime: Date;
  duration: number; // in minutes
  location: string;
  type: 'standup' | 'review' | 'planning' | 'other';
}

export function MeetingsCard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  
  // Mock meetings data
  const meetings: Meeting[] = [
    {
      id: '1',
      title: 'Daily Standup',
      participants: ['John', 'Sarah', 'Mike'],
      startTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      duration: 15,
      location: 'Conference Room A',
      type: 'standup'
    },
    {
      id: '2',
      title: 'Sprint Review',
      participants: ['Team', 'Stakeholders'],
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      duration: 60,
      location: 'Main Conference Room',
      type: 'review'
    },
    {
      id: '3',
      title: 'Design Review Session',
      participants: ['Design Team', 'PM'],
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 45,
      location: 'Design Studio',
      type: 'review'
    }
  ];

  const sortedMeetings = meetings.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const getTimeUntil = (startTime: Date) => {
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'standup': return 'border-blue-400 text-blue-400';
      case 'review': return 'border-purple-400 text-purple-400';
      case 'planning': return 'border-green-400 text-green-400';
      default: return 'border-gray-400 text-gray-400';
    }
  };

  // Check for upcoming meetings (5 minutes warning)
  useEffect(() => {
    const checkMeetings = () => {
      const now = new Date();
      const upcomingMeetings = meetings.filter(meeting => {
        const diff = meeting.startTime.getTime() - now.getTime();
        return diff > 0 && diff <= 5 * 60 * 1000; // 5 minutes
      });

      const newAlerts = upcomingMeetings.map(meeting => meeting.id);
      setAlerts(newAlerts);
    };

    const interval = setInterval(checkMeetings, 60000); // Check every minute
    checkMeetings(); // Check immediately

    return () => clearInterval(interval);
  }, [meetings]);

  return (
    <>
      <Card className="bg-slate-800/50 border-pink-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-pink-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Meetings
              {alerts.length > 0 && (
                <Badge variant="destructive" className="bg-red-600">
                  {alerts.length}
                </Badge>
              )}
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowCreateModal(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {sortedMeetings.map((meeting) => {
              const isUpcoming = alerts.includes(meeting.id);
              const timeUntil = getTimeUntil(meeting.startTime);
              
              return (
                <div 
                  key={meeting.id} 
                  className={`p-3 rounded-lg border transition-colors ${
                    isUpcoming 
                      ? 'bg-red-400/10 border-red-400/50' 
                      : 'bg-slate-700/50 border-slate-600 hover:border-pink-400/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      {meeting.title}
                      {isUpcoming && <AlertCircle className="w-4 h-4 text-red-400" />}
                    </h4>
                    <Badge variant="outline" className={getMeetingTypeColor(meeting.type)}>
                      {meeting.type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{meeting.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>({meeting.duration}m)</span>
                      <span className="text-pink-400">in {timeUntil}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="w-3 h-3" />
                      <span>{meeting.participants.join(', ')}</span>
                    </div>
                    
                    <div className="text-slate-500 text-xs">
                      📍 {meeting.location}
                    </div>
                  </div>
                  
                  {isUpcoming && (
                    <div className="mt-2 p-2 bg-red-400/20 rounded text-red-400 text-xs">
                      ⚠️ Meeting starts in {timeUntil}!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <CreateMeetingModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </>
  );
}