import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Target, Clock, Bell, Star, X, Hand, Snowflake, Pause, Loader2, AlertCircle } from 'lucide-react';
import { useMissionData } from './MissionDataContext';
import { useModals } from './ModalsContext';

export function ObjectivesCard() {
  const missionData = useMissionData();
  const modals = useModals();
  
  // Get data from mission data system
  const objectives = missionData.objectives.get();
  const reminders = missionData.reminders.get();

  const getDeadlineStatus = (objective: any) => {
    const now = new Date();
    const deadline = new Date(objective.deadline);
    const createdAt = new Date(objective.createdAt);
    
    const totalTime = deadline.getTime() - createdAt.getTime();
    const elapsed = now.getTime() - createdAt.getTime();
    const remaining = deadline.getTime() - now.getTime();
    const progress = elapsed / totalTime;
    
    const daysRemaining = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    
    if (progress <= 1/3) {
      return { color: 'green', daysRemaining, status: 'On Track' };
    } else if (progress <= 2/3) {
      return { color: 'yellow', daysRemaining, status: 'Caution' };
    } else {
      return { color: 'red', daysRemaining, status: 'Critical' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Target className="w-4 h-4 text-cyan-400" />;
      case 'ACHIEVED': return <Star className="w-4 h-4 text-green-400" />;
      case 'ABORTED': return <X className="w-4 h-4 text-red-400" />;
      case 'INTERRUPTED': return <Hand className="w-4 h-4 text-orange-400" />;
      case 'ARCHIVED': return <Snowflake className="w-4 h-4 text-slate-400" />;
      case 'PAUSED': return <Pause className="w-4 h-4 text-yellow-400" />;
      default: return <Target className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'border-cyan-400 text-cyan-400';
      case 'ACHIEVED': return 'border-green-400 text-green-400';
      case 'ABORTED': return 'border-red-400 text-red-400';
      case 'INTERRUPTED': return 'border-orange-400 text-orange-400';
      case 'ARCHIVED': return 'border-slate-400 text-slate-400';
      case 'PAUSED': return 'border-yellow-400 text-yellow-400';
      default: return 'border-cyan-400 text-cyan-400';
    }
  };

  // Filter reminders by time
  const nearReminders = reminders.filter((r: any) => {
    const reminderDate = new Date(r.date || new Date());
    const now = new Date();
    const diffDays = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7 && diffDays >= 0; // Next 7 days
  });
  
  const futureReminders = reminders.filter((r: any) => {
    const reminderDate = new Date(r.date || new Date());
    const now = new Date();
    const diffDays = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  });

  const handleObjectiveTitleClick = (objective: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log('ObjectivesCard: Opening objective detail modal for:', objective.id);
    modals.objectives.showDetail(objective.id, objective);
  };

  const handleReminderClick = (reminder: any) => {
    console.log('ObjectivesCard: Opening reminder detail modal for:', reminder.id);
    modals.reminders.showDetail(reminder.id, reminder);
  };

  // Show loading state
  if (missionData.objectives.isLoading && !missionData.objectives.isInitialized) {
    return (
      <Card className="bg-slate-800/50 border-cyan-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-cyan-400">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Strategic Objectives
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-cyan-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading objectives...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (missionData.objectives.error) {
    return (
      <Card className="bg-slate-800/50 border-red-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Strategic Objectives
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>Error loading objectives: {missionData.objectives.error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-cyan-400/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-cyan-400">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Strategic Objectives
          </div>
          <Button 
            size="sm" 
            onClick={() => modals.objectives.openNew()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Objectives */}
        <div className="space-y-3">
          {objectives.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No strategic objectives defined</p>
              <p className="text-sm">Create your first objective to get started</p>
            </div>
          ) : (
            objectives.map((objective) => {
              const { color, daysRemaining, status } = getDeadlineStatus(objective);
              return (
                <div key={objective.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-cyan-400/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(objective.status)}
                      <h4 
                        className="text-white font-medium cursor-pointer hover:text-cyan-400 transition-colors"
                        onClick={(e) => handleObjectiveTitleClick(objective, e)}
                      >
                        {objective.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(objective.status)}>
                        {objective.status}
                      </Badge>
                      {objective.status === 'ACTIVE' && (
                        <Badge 
                          variant="outline" 
                          className={`
                            ${color === 'green' ? 'border-green-400 text-green-400' : ''}
                            ${color === 'yellow' ? 'border-yellow-400 text-yellow-400' : ''}
                            ${color === 'red' ? 'border-red-400 text-red-400' : ''}
                          `}
                        >
                          {daysRemaining}d
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{objective.description}</p>
                  <div className="flex items-center justify-between">
                    {objective.status === 'ACTIVE' && (
                      <Badge variant="secondary" className="text-xs">
                        {status}
                      </Badge>
                    )}
                    <span className="text-xs text-slate-500 ml-auto">
                      Due: {new Date(objective.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

          {/* Reminders */}
          <div className="border-t border-slate-600 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Neural Reminders
              </h4>
              <Button 
                size="sm" 
                onClick={() => modals.reminders.openNew()}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                title="Set Neural Reminder"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {nearReminders.length === 0 && futureReminders.length === 0 && (
              <div className="text-center py-6 text-slate-400">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>No neural reminders active</p>
                <p className="text-sm">Set your first reminder to stay on track</p>
              </div>
            )}

            {nearReminders.length > 0 && (
              <div className="mb-3">
                <h5 className="text-yellow-400 text-sm mb-2">This Week</h5>
                <div className="space-y-2">
                  {nearReminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-2 p-2 bg-yellow-400/10 rounded border border-yellow-400/30 hover:border-yellow-400/50 cursor-pointer transition-colors" onClick={() => handleReminderClick(reminder)}>
                      <Clock className="w-3 h-3 text-yellow-400" />
                      <span className="text-white text-sm">{reminder.text}</span>
                      <span className="text-xs text-yellow-400 ml-auto">
                        {new Date(reminder.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {futureReminders.length > 0 && (
              <div>
                <h5 className="text-slate-400 text-sm mb-2">Upcoming</h5>
                <div className="space-y-2">
                  {futureReminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded hover:bg-slate-700/50 cursor-pointer transition-colors" onClick={() => handleReminderClick(reminder)}>
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-300 text-sm">{reminder.text}</span>
                      <span className="text-xs text-slate-500 ml-auto">
                        {new Date(reminder.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}