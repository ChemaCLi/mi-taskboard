import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Target, Clock, Bell, Star, X, Hand, Snowflake, Pause } from 'lucide-react';
import { CreateObjectiveModal } from './CreateObjectiveModal';
import { ObjectiveDetailModal } from './ObjectiveDetailModal';
import { ReminderDetailModal } from './ReminderDetailModal';
import { useObjectiveContext } from './ObjectiveContext';

export function ObjectivesCard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [selectedReminder, setSelectedReminder] = useState(null);
  
  const { objectives, reminders, updateObjective, deleteObjective, updateReminder, deleteReminder } = useObjectiveContext();

  const getDeadlineStatus = (objective: any) => {
    const now = new Date();
    const totalTime = objective.deadline.getTime() - objective.createdAt.getTime();
    const elapsed = now.getTime() - objective.createdAt.getTime();
    const remaining = objective.deadline.getTime() - now.getTime();
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

  const nearReminders = reminders.filter(r => r.isNear);
  const futureReminders = reminders.filter(r => !r.isNear);

  const handleObjectiveClick = (objective: any) => {
    setSelectedObjective(objective);
    setShowObjectiveModal(true);
  };

  const handleReminderClick = (reminder: any) => {
    setSelectedReminder(reminder);
    setShowReminderModal(true);
  };

  const handleObjectiveSave = (updatedObjective: any) => {
    updateObjective(updatedObjective);
  };

  const handleObjectiveDelete = (objectiveId: string) => {
    deleteObjective(objectiveId);
  };

  const handleReminderSave = (updatedReminder: any) => {
    updateReminder(updatedReminder);
  };

  const handleReminderDelete = (reminderId: string) => {
    deleteReminder(reminderId);
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-cyan-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-cyan-400">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Sprint Objectives
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowCreateModal(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Objectives */}
          <div className="space-y-3">
            {objectives.map((objective) => {
              const { color, daysRemaining, status } = getDeadlineStatus(objective);
              return (
                <div key={objective.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-cyan-400/50 transition-colors cursor-pointer" onClick={() => handleObjectiveClick(objective)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(objective.status)}
                      <h4 className="text-white font-medium">{objective.title}</h4>
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
                      Due: {objective.deadline.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reminders */}
          <div className="border-t border-slate-600 pt-4">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Reminders
            </h4>
            
            {nearReminders.length > 0 && (
              <div className="mb-3">
                <h5 className="text-yellow-400 text-sm mb-2">This Week</h5>
                <div className="space-y-2">
                  {nearReminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-2 p-2 bg-yellow-400/10 rounded border border-yellow-400/30 hover:border-yellow-400/50 cursor-pointer transition-colors" onClick={() => handleReminderClick(reminder)}>
                      <Clock className="w-3 h-3 text-yellow-400" />
                      <span className="text-white text-sm">{reminder.text}</span>
                      <span className="text-xs text-yellow-400 ml-auto">
                        {reminder.date.toLocaleDateString()}
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
                        {reminder.date.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateObjectiveModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />

      <ObjectiveDetailModal
        open={showObjectiveModal}
        onOpenChange={setShowObjectiveModal}
        objective={selectedObjective}
        onSave={handleObjectiveSave}
        onDelete={handleObjectiveDelete}
      />

      <ReminderDetailModal
        open={showReminderModal}
        onOpenChange={setShowReminderModal}
        reminder={selectedReminder}
        onSave={handleReminderSave}
        onDelete={handleReminderDelete}
      />
    </>
  );
}