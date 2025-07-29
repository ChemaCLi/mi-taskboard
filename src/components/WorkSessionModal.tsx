import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Target } from 'lucide-react';

interface WorkSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartSession: (workDescription: string) => void;
  existingWork?: string;
}

export function WorkSessionModal({ open, onOpenChange, onStartSession, existingWork }: WorkSessionModalProps) {
  const [workDescription, setWorkDescription] = useState('');

  // Load existing work when modal opens
  React.useEffect(() => {
    if (open) {
      setWorkDescription(existingWork || '');
    }
  }, [open, existingWork]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (workDescription.trim()) {
      onStartSession(workDescription.trim());
      setWorkDescription('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            What are you working on?
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="work" className="text-white">Current Focus</Label>
            <Textarea
              id="work"
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Describe what you'll be working on during this pomodoro session..."
              className="bg-slate-800 border-slate-600 text-white"
              rows={3}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              Start Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}