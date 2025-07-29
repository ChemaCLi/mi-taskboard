import React, { createContext, useContext, useState } from 'react';

interface Objective {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  status: 'ACTIVE' | 'ACHIEVED' | 'ABORTED' | 'INTERRUPTED' | 'ARCHIVED' | 'PAUSED';
  priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  details?: string;
  peopleHelp?: string[];
  timeNeeded?: number;
  purpose?: string;
  existing?: string;
  complexities?: string;
  resources?: any;
  createdAt: Date;
  updatedAt?: Date;
}

interface Reminder {
  id: string;
  text: string;
  date: Date;
  isNear: boolean;
  alertEnabled: boolean;
  alertMinutes: number;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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

interface ObjectiveContextType {
  objectives: Objective[];
  reminders: Reminder[];
  meetings: Meeting[];
  updateObjective: (objective: Objective) => void;
  deleteObjective: (objectiveId: string) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (reminderId: string) => void;
  updateMeeting: (meeting: Meeting) => void;
  deleteMeeting: (meetingId: string) => void;
  getActiveObjectives: () => Objective[];
  getObjectiveStats: () => {
    achievedThisMonth: number;
    totalThisMonth: number;
    activeCount: number;
  };
}

const ObjectiveContext = createContext<ObjectiveContextType | null>(null);

export const useObjectiveContext = () => {
  const context = useContext(ObjectiveContext);
  if (!context) {
    throw new Error('useObjectiveContext must be used within an ObjectiveProvider');
  }
  return context;
};

interface ObjectiveProviderProps {
  children: React.ReactNode;
}

// Mock initial objectives data
const initialObjectives: Objective[] = [
  {
    id: 'obj-1',
    title: 'Complete Q1 Dashboard Redesign',
    description: 'Redesign the main analytics dashboard with new UX improvements',
    deadline: new Date('2025-02-15'),
    status: 'ACTIVE',
    priority: 'HIGH',
    createdAt: new Date('2025-01-01'),
    details: 'Focus on user experience and modern design patterns',
    peopleHelp: ['Design Team', 'Frontend Team'],
    timeNeeded: 80,
    purpose: 'Improve user engagement and reduce bounce rate'
  },
  {
    id: 'obj-2',
    title: 'Implement User Authentication',
    description: 'Add OAuth and JWT authentication system',
    deadline: new Date('2025-02-28'),
    status: 'ACTIVE',
    priority: 'MEDIUM',
    createdAt: new Date('2025-01-10'),
    details: 'Support Google, GitHub, and email/password login',
    peopleHelp: ['Backend Team', 'Security Team'],
    timeNeeded: 60,
    purpose: 'Secure user accounts and enable personalization'
  },
  {
    id: 'obj-3',
    title: 'Launch Mobile App Beta',
    description: 'Release beta version of mobile application',
    deadline: new Date('2025-01-15'),
    status: 'ACHIEVED',
    priority: 'HIGH',
    createdAt: new Date('2024-12-01'),
    details: 'Successfully launched with 500+ beta testers',
    timeNeeded: 120,
    purpose: 'Expand platform reach to mobile users'
  }
];

// Mock initial reminders data
const initialReminders: Reminder[] = [
  {
    id: 'rem-1',
    text: 'Review design mockups with team',
    date: new Date('2025-01-30'),
    isNear: true,
    alertEnabled: true,
    alertMinutes: 60,
    completed: false,
    createdAt: new Date('2025-01-20')
  },
  {
    id: 'rem-2',
    text: 'Schedule user testing sessions',
    date: new Date('2025-02-05'),
    isNear: true,
    alertEnabled: true,
    alertMinutes: 30,
    completed: false,
    createdAt: new Date('2025-01-22')
  },
  {
    id: 'rem-3',
    text: 'Prepare Q2 planning presentation',
    date: new Date('2025-03-15'),
    isNear: false,
    alertEnabled: true,
    alertMinutes: 1440, // 24 hours
    completed: false,
    createdAt: new Date('2025-01-15')
  }
];

// Mock initial meetings data
const initialMeetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Daily Standup',
    participants: ['John', 'Sarah', 'Mike'],
    datetime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    duration: 15,
    location: 'Conference Room A',
    type: 'standup',
    alertEnabled: true,
    alertMinutes: 5,
    completed: false
  },
  {
    id: 'meet-2',
    title: 'Sprint Review',
    participants: ['Team', 'Stakeholders'],
    datetime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 60,
    location: 'Main Conference Room',
    type: 'review',
    alertEnabled: true,
    alertMinutes: 15,
    completed: false
  },
  {
    id: 'meet-3',
    title: 'Design Review Session',
    participants: ['Design Team', 'PM'],
    datetime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 45,
    location: 'Design Studio',
    type: 'review',
    alertEnabled: true,
    alertMinutes: 10,
    completed: false
  }
];

export function ObjectiveProvider({ children }: ObjectiveProviderProps) {
  const [objectives, setObjectives] = useState<Objective[]>(initialObjectives);
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);

  const updateObjective = (updatedObjective: Objective) => {
    setObjectives(prevObjectives =>
      prevObjectives.map(objective =>
        objective.id === updatedObjective.id ? { ...updatedObjective, updatedAt: new Date() } : objective
      )
    );
  };

  const deleteObjective = (objectiveId: string) => {
    setObjectives(prevObjectives => prevObjectives.filter(objective => objective.id !== objectiveId));
  };

  const updateReminder = (updatedReminder: Reminder) => {
    setReminders(prevReminders =>
      prevReminders.map(reminder =>
        reminder.id === updatedReminder.id ? { ...updatedReminder, updatedAt: new Date() } : reminder
      )
    );
  };

  const deleteReminder = (reminderId: string) => {
    setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== reminderId));
  };

  const updateMeeting = (updatedMeeting: Meeting) => {
    setMeetings(prevMeetings =>
      prevMeetings.map(meeting =>
        meeting.id === updatedMeeting.id ? { ...updatedMeeting, updatedAt: new Date() } : meeting
      )
    );
  };

  const deleteMeeting = (meetingId: string) => {
    setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== meetingId));
  };

  const getActiveObjectives = () => {
    return objectives.filter(objective => objective.status === 'ACTIVE');
  };

  const getObjectiveStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter objectives created this month
    const thisMonthObjectives = objectives.filter(objective => {
      const createdDate = new Date(objective.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    });

    const achievedThisMonth = thisMonthObjectives.filter(obj => obj.status === 'ACHIEVED').length;
    const totalThisMonth = thisMonthObjectives.length;
    const activeCount = objectives.filter(obj => obj.status === 'ACTIVE').length;

    return {
      achievedThisMonth,
      totalThisMonth,
      activeCount
    };
  };

  return (
    <ObjectiveContext.Provider value={{
      objectives,
      reminders,
      meetings,
      updateObjective,
      deleteObjective,
      updateReminder,
      deleteReminder,
      updateMeeting,
      deleteMeeting,
      getActiveObjectives,
      getObjectiveStats
    }}>
      {children}
    </ObjectiveContext.Provider>
  );
} 