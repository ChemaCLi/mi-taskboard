import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ArrowRight, Clock, Target, Calendar } from 'lucide-react';

interface StartDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartDay: () => void;
}

export function StartDayModal({ open, onOpenChange, onStartDay }: StartDayModalProps) {
  // Mock recommendations based on day of week and historical data
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  
  const recommendations = {
    recommendedTasks: 6,
    averageCapacity: 5.2,
    confidence: 85
  };

  const handleStartMission = () => {
    onStartDay();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-green-400" />
            Mission Briefing - {dayName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Daily Intelligence */}
          <Card className="bg-slate-800/50 border-cyan-400/30">
            <CardContent className="p-4">
              <h3 className="text-cyan-400 font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Daily Intelligence Report
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{recommendations.recommendedTasks}</div>
                  <div className="text-xs text-slate-400">Recommended Tasks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{recommendations.averageCapacity}</div>
                  <div className="text-xs text-slate-400">Avg {dayName} Capacity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{recommendations.confidence}%</div>
                  <div className="text-xs text-slate-400">Confidence Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Preparation */}
          <Card className="bg-slate-800/50 border-orange-400/30">
            <CardContent className="p-4">
              <h3 className="text-orange-400 font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pre-Mission Checklist
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                  <span className="text-white text-sm">Review backlog and select today's tasks</span>
                  <Badge variant="outline" className="border-orange-400 text-orange-400">Ready</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                  <span className="text-white text-sm">Move low-priority items to tomorrow if needed</span>
                  <Badge variant="outline" className="border-orange-400 text-orange-400">Ready</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                  <span className="text-white text-sm">Check meeting schedule for today</span>
                  <Badge variant="outline" className="border-orange-400 text-orange-400">Ready</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historical Performance */}
          <Card className="bg-slate-800/50 border-purple-400/30">
            <CardContent className="p-4">
              <h3 className="text-purple-400 font-medium mb-3">Recent Performance Metrics</h3>
              <div className="text-sm text-slate-300 space-y-1">
                <p>• Yesterday: 4/6 tasks completed (67%)</p>
                <p>• This week: 18/24 tasks completed (75%)</p>
                <p>• Average {dayName} performance: 5.2/6 tasks (87%)</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              onClick={handleStartMission}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              <Target className="w-5 h-5 mr-2" />
              Begin Mission
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}