import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, Users, AlertCircle, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { CreateMeetingModal } from './CreateMeetingModal';
import { MeetingDetailModal } from './MeetingDetailModal';
import { useMissionData } from './MissionDataContext';

// Mock meetings data - moved outside component to prevent recreation on every render
const mockMeetings = [
  {
    id: 'mock-1',
    title: 'Daily Standup',
    participants: ['John', 'Sarah', 'Mike'],
    startTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    duration: 15,
    location: 'Conference Room A',
    type: 'standup'
  },
  {
    id: 'mock-2',
    title: 'Sprint Review',
    participants: ['Team', 'Stakeholders'],
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 60,
    location: 'Main Conference Room',
    type: 'review'
  },
  {
    id: 'mock-3',
    title: 'Design Review Session',
    participants: ['Design Team', 'PM'],
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 45,
    location: 'Design Studio',
    type: 'review'
  }
];

interface Meeting {
  id: string;
  title: string;
  participants?: string[];
  startTime?: Date;
  duration?: number; // in minutes
  location?: string;
  type?: 'standup' | 'review' | 'planning' | 'other';
  // Mission Data System fields
  datetime?: string;
  description?: string;
  alertEnabled?: boolean;
  alertMinutes?: number;
  completed?: boolean;
  // Allow additional properties for flexibility
  [key: string]: any;
}

export function MeetingsCard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const missionData = useMissionData();
  
  // Get meetings from Mission Data System, fall back to mock data for now
  const apiMeetings = missionData.meetings.get();
  
  // Convert API meetings to display format and combine with mock data
  const meetings = useMemo(() => {
    const convertedApiMeetings = apiMeetings.map(meeting => ({
      // Keep original API data first
      ...meeting,
      // Override/add display-specific properties
      participants: [], // API doesn't have participants yet
      startTime: meeting.datetime ? new Date(meeting.datetime) : new Date(),
      duration: meeting.duration || 30,
      location: 'Virtual', // Default for API meetings
      type: 'other' as const
    }));

    // Combine API meetings with mock meetings (remove mock if API has data)
    return apiMeetings.length > 0 
      ? convertedApiMeetings 
      : mockMeetings;
  }, [apiMeetings]);

  const sortedMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => {
      const aTime = a.startTime?.getTime() || 0;
      const bTime = b.startTime?.getTime() || 0;
      return aTime - bTime;
    });
  }, [meetings]);

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

  // Check for upcoming meetings (5 minutes warning) - Fixed dependency
  useEffect(() => {
    const checkMeetings = () => {
      const now = new Date();
      const upcomingMeetings = meetings.filter(meeting => {
        if (!meeting.startTime) return false;
        const diff = meeting.startTime.getTime() - now.getTime();
        return diff > 0 && diff <= 5 * 60 * 1000; // 5 minutes
      });

      const newAlerts = upcomingMeetings.map(meeting => meeting.id);
      
      // Only update if alerts actually changed
      setAlerts(prevAlerts => {
        const alertsChanged = 
          newAlerts.length !== prevAlerts.length ||
          newAlerts.some(id => !prevAlerts.includes(id));
        
        return alertsChanged ? newAlerts : prevAlerts;
      });
    };

    const interval = setInterval(checkMeetings, 60000); // Check every minute
    checkMeetings(); // Check immediately

    return () => clearInterval(interval);
  }, [meetings.length]); // Only depend on length to avoid infinite loops

  const handleMeetingClick = (meeting: any) => {
    setSelectedMeeting(meeting);
    setShowMeetingModal(true);
  };

  const handleMeetingSave = async (updatedMeeting: any) => {
    if (updatedMeeting.id.startsWith('mock-')) {
      // Mock meeting - just log for now
      console.log('Updating mock meeting:', updatedMeeting);
    } else {
      // Real API meeting
      await missionData.meetings.update(updatedMeeting.id, updatedMeeting);
    }
  };

  const handleMeetingDelete = async (meetingId: string) => {
    if (meetingId.startsWith('mock-')) {
      // Mock meeting - just log for now
      console.log('Deleting mock meeting:', meetingId);
    } else {
      // Real API meeting
      await missionData.meetings.delete(meetingId);
    }
  };

  // Show loading state
  if (missionData.meetings.isLoading && !missionData.meetings.isInitialized) {
    return (
      <Card className="bg-slate-800/50 border-pink-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-pink-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Strategic Briefings
              <Badge variant="outline" className="border-pink-400 text-pink-400">
                ...
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="text-center text-slate-500 py-8">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
              <p>Loading briefings...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (missionData.meetings.error) {
    return (
      <Card className="bg-slate-800/50 border-red-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-red-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Strategic Briefings
              <Badge variant="outline" className="border-red-400 text-red-400">
                Error
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="text-center text-red-400 py-8">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>Error loading briefings</p>
              <p className="text-xs text-red-300 mt-1">{missionData.meetings.error}</p>
              <Button 
                size="sm" 
                onClick={() => missionData.meetings.refresh()}
                className="mt-2 bg-red-600 hover:bg-red-700"
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-slate-800/50 border-pink-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-pink-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Strategic Briefings
              {alerts.length > 0 && (
                <Badge variant="destructive" className="bg-red-600">
                  {alerts.length}
                </Badge>
              )}
              <Badge variant="outline" className="border-pink-400 text-pink-400">
                {sortedMeetings.length}
              </Badge>
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
            {sortedMeetings.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No briefings scheduled</p>
                <p className="text-xs">Create strategic meetings to coordinate missions</p>
              </div>
            ) : (
              sortedMeetings.map((meeting) => {
                const isUpcoming = alerts.includes(meeting.id);
                const timeUntil = meeting.startTime ? getTimeUntil(meeting.startTime) : 'Unknown';
                
                return (
                  <div 
                    key={meeting.id} 
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      isUpcoming 
                        ? 'bg-red-400/10 border-red-400/50 hover:border-red-400/70' 
                        : 'bg-slate-700/50 border-slate-600 hover:border-pink-400/50'
                    }`}
                    onClick={() => handleMeetingClick(meeting)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        {meeting.title}
                        {isUpcoming && <AlertCircle className="w-4 h-4 text-red-400" />}
                      </h4>
                      <Badge variant="outline" className={getMeetingTypeColor(meeting.type || 'other')}>
                        {meeting.type || 'briefing'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      {meeting.startTime && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{meeting.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>({meeting.duration || 30}m)</span>
                          <span className="text-pink-400">in {timeUntil}</span>
                        </div>
                      )}
                      
                      {meeting.participants && meeting.participants.length > 0 && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Users className="w-3 h-3" />
                          <span>{meeting.participants.join(', ')}</span>
                        </div>
                      )}
                      
                      {meeting.location && (
                        <div className="text-slate-500 text-xs">
                          📍 {meeting.location}
                        </div>
                      )}

                                             {meeting?.description && (
                         <div className="text-slate-400 text-xs mt-1">
                           {meeting.description}
                         </div>
                       )}
                    </div>
                    
                    {isUpcoming && meeting.startTime && (
                      <div className="mt-2 p-2 bg-red-400/20 rounded text-red-400 text-xs">
                        ⚠️ Briefing starts in {timeUntil}!
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <CreateMeetingModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />

      <MeetingDetailModal
        open={showMeetingModal}
        onOpenChange={setShowMeetingModal}
        meeting={selectedMeeting}
        onSave={handleMeetingSave}
        onDelete={handleMeetingDelete}
      />
    </>
  );
}