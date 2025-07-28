import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Target, Clock, Bell } from 'lucide-react';
import { CreateObjectiveModal } from './CreateObjectiveModal';

interface Objective {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  createdAt: Date;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface Reminder {
  id: string;
  text: string;
  date: Date;
  isNear: boolean;
}

export function ObjectivesCard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Mock data
  const objectives: Objective[] = [
    {
      id: '1',
      title: 'Complete Q1 Dashboard Redesign',
      description: 'Redesign the main analytics dashboard with new UX improvements',
      deadline: new Date('2025-02-15'),
      createdAt: new Date('2025-01-01'),
      completed: false,
      priority: 'high'
    },
    {
      id: '2', 
      title: 'Implement User Authentication',
      description: 'Add OAuth and JWT authentication system',
      deadline: new Date('2025-02-28'),
      createdAt: new Date('2025-01-10'),
      completed: false,
      priority: 'medium'
    }
  ];

  const reminders: Reminder[] = [
    {
      id: '1',
      text: 'Review design mockups with team',
      date: new Date('2025-01-30'),
      isNear: true
    },
    {
      id: '2',
      text: 'Schedule user testing sessions',
      date: new Date('2025-02-05'),
      isNear: true
    },
    {
      id: '3',
      text: 'Prepare Q2 planning presentation',
      date: new Date('2025-03-15'),
      isNear: false
    }
  ];

  const getDeadlineStatus = (objective: Objective) => {
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

  const nearReminders = reminders.filter(r => r.isNear);
  const futureReminders = reminders.filter(r => !r.isNear);

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
                <div key={objective.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{objective.title}</h4>
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
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{objective.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {status}
                    </Badge>
                    <span className="text-xs text-slate-500">
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
                    <div key={reminder.id} className="flex items-center gap-2 p-2 bg-yellow-400/10 rounded border border-yellow-400/30">
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
                    <div key={reminder.id} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
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
    </>
  );
}