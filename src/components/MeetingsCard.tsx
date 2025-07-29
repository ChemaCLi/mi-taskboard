import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, Users, AlertCircle, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { useMissionData } from './MissionDataContext';
import { useModals } from './ModalsContext';

// API Meeting type from the backend
interface APIMeeting {
  id: string;
  title: string;
  description?: string;
  datetime: string;
  duration?: number;
  alertEnabled: boolean;
  alertMinutes: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  // Optional fields that might be added later
  participants?: string[];
  location?: string;
  type?: 'standup' | 'review' | 'planning' | 'other';
}

// UI Meeting type for the component
interface Meeting {
  id: string;
  title: string;
  participants: string[];
  startTime: Date;
  datetime: string;
  duration?: number;
  location: string;
  type: 'standup' | 'review' | 'planning' | 'other';
  description?: string;
  alertEnabled: boolean;
  alertMinutes: number;
  completed: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function MeetingsCard() {
  const [alerts, setAlerts] = useState<string[]>([]);

  const missionData = useMissionData();
  const modals = useModals();

  // Use missionData for meetings
  const apiMeetings = missionData.meetings.get() as APIMeeting[];
  
  // Convert API meetings to component format
  const meetings = useMemo(() => {
    return apiMeetings.map((meeting): Meeting => ({
      ...meeting,
      startTime: new Date(meeting.datetime),
      type: meeting.type || 'other',
      participants: meeting.participants || [],
      location: meeting.location || ''
    }));
  }, [apiMeetings]);

  const sortedMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => {
      const timeA = a.startTime.getTime();
      const timeB = b.startTime.getTime();
      return timeA - timeB;
    });
  }, [meetings]);

  // Check for upcoming meetings and set alerts
  useEffect(() => {
    const checkUpcomingMeetings = () => {
      const now = new Date();
      const upcomingAlerts: string[] = [];

      meetings.forEach(meeting => {
        const timeDiff = meeting.startTime.getTime() - now.getTime();
        const minutesUntil = Math.floor(timeDiff / (1000 * 60));

        if (minutesUntil > 0 && minutesUntil <= 15) {
          upcomingAlerts.push(`${meeting.title} starts in ${minutesUntil} minutes`);
        }
      });

      // Only update alerts if they actually changed
      if (JSON.stringify(upcomingAlerts) !== JSON.stringify(alerts)) {
        setAlerts(upcomingAlerts);
      }
    };

    checkUpcomingMeetings();
    const interval = setInterval(checkUpcomingMeetings, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [meetings.length]); // Depend on meetings.length instead of meetings array

  const handleMeetingClick = (meeting: Meeting) => {
    modals.meetings.showDetail(meeting.id, meeting);
  };

  const getUrgencyBorder = (meeting: Meeting) => {
    const now = new Date();
    const timeDiff = meeting.startTime.getTime() - now.getTime();
    const minutesUntil = Math.floor(timeDiff / (1000 * 60));

    if (minutesUntil < 0) return 'border-gray-500'; // Past meeting
    if (minutesUntil <= 5) return 'border-red-500'; // Very urgent
    if (minutesUntil <= 30) return 'border-orange-500'; // Urgent
    if (minutesUntil <= 60) return 'border-yellow-500'; // Soon
    return 'border-slate-600'; // Normal
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'standup': return 'border-blue-400 text-blue-400';
      case 'review': return 'border-purple-400 text-purple-400';
      case 'planning': return 'border-green-400 text-green-400';
      default: return 'border-gray-400 text-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Strategic Briefings
              {missionData.meetings.isLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              )}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => modals.meetings.openNew()}
              className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {missionData.meetings.error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">Error loading meetings</span>
              </div>
            </div>
          )}

          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">{alert}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {missionData.meetings.isLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading strategic briefings...
              </div>
            ) : sortedMeetings.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No briefings scheduled</p>
                <p className="text-xs text-slate-500 mt-1">Click "Schedule" to create your first briefing</p>
              </div>
            ) : (
              sortedMeetings.map((meeting) => {
                const isUpcoming = meeting.startTime.getTime() > Date.now() && 
                                 meeting.startTime.getTime() - Date.now() <= 5 * 60 * 1000; // Within 5 minutes

                return (
                  <div 
                    key={meeting.id} 
                    className={`p-3 rounded-lg border ${getUrgencyBorder(meeting)} hover:bg-slate-800/50 transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${getMeetingTypeColor(meeting.type)} text-xs`}>
                          {meeting.type}
                        </Badge>
                        <h3 
                          className="font-medium text-white cursor-pointer hover:text-cyan-400 transition-colors"
                          onClick={() => handleMeetingClick(meeting)}
                        >
                          {meeting.title}
                        </h3>
                      </div>
                      {isUpcoming && (
                        <Badge variant="outline" className="border-red-400 text-red-400 text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          URGENT
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(meeting.startTime)} at {formatTime(meeting.startTime)}
                        </div>
                        {meeting.duration && (
                          <span>({meeting.duration}min)</span>
                        )}
                      </div>
                      
                      {meeting.participants && meeting.participants.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-slate-400">
                          <Users className="w-3 h-3" />
                          <span>{meeting.participants.join(', ')}</span>
                        </div>
                      )}

                      {meeting.location && (
                        <div className="text-sm text-slate-500">
                          📍 {meeting.location}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}