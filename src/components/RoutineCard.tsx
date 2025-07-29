import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Checkbox } from './ui/checkbox';
import { CalendarDays, CheckCircle } from 'lucide-react';

interface RoutineItem {
  id: string;
  text: string;
  completed: boolean;
}

export function RoutineCard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([
    { id: '1', text: 'Morning meditation (10 min)', completed: false },
    { id: '2', text: 'Exercise/workout', completed: false },
    { id: '3', text: 'Review daily goals', completed: false },
    { id: '4', text: 'Drink 8 glasses of water', completed: false },
    { id: '5', text: 'Read for 30 minutes', completed: false },
    { id: '6', text: 'Plan tomorrow\'s tasks', completed: false },
    { id: '7', text: 'Evening reflection', completed: false },
    { id: '8', text: 'Sleep by 11 PM', completed: false },
  ]);

  const toggleRoutineItem = (id: string) => {
    setRoutineItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = routineItems.filter(item => item.completed).length;
  const totalCount = routineItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Card className="bg-slate-800/50 border-green-400/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-green-400">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Routine
            <div className="flex items-center gap-1 text-xs">
              <CheckCircle className="w-4 h-4" />
              <span>{completedCount}/{totalCount} ({completionPercentage}%)</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-green-400 mb-2">Calendar</h3>
            <div className="bg-slate-700/30 rounded-lg p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0"
                classNames={{
                  day_selected: "bg-green-600 text-white hover:bg-green-700",
                  day_today: "bg-green-400/20 text-green-400",
                  nav_button: "text-green-400 hover:text-green-300",
                  caption_label: "text-white",
                  head_cell: "text-slate-400",
                  day: "text-white hover:bg-slate-600/50",
                }}
              />
            </div>
          </div>

          {/* Daily Routine Checklist Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-green-400 mb-2">Daily Routine</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto bg-slate-700/30 rounded-lg p-3">
              {routineItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleRoutineItem(item.id)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <label
                    htmlFor={item.id}
                    className={`text-sm cursor-pointer flex-1 ${
                      item.completed
                        ? 'text-slate-400 line-through'
                        : 'text-white'
                    }`}
                  >
                    {item.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 