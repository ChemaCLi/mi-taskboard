import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useMissionData } from './MissionDataContext';

interface CreateObjectiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (objectiveData: any) => Promise<void>;
}

export function CreateObjectiveModal({ open, onOpenChange, onSave }: CreateObjectiveModalProps) {
  const missionData = useMissionData();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: undefined as Date | undefined,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ title: '', description: '', deadline: undefined });
    setError(null);
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      console.log('CreateObjectiveModal: Submitting objective data', formData);
      
      const objectiveData = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline?.toISOString(),
        status: 'ACTIVE' as const,
      };

      console.log('CreateObjectiveModal: Objective data for save', objectiveData);

      if (onSave) {
        await onSave(objectiveData);
      } else {
        const newObjective = await missionData.objectives.create(objectiveData);
        if (!newObjective) {
          setError('Failed to create objective. Please try again.');
        }
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating objective:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">🎯 Initialize Strategic Objective</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-cyan-400">Mission Objective</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Define your strategic objective..."
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              disabled={isCreating}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-cyan-400">Mission Briefing</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed mission briefing and success criteria..."
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              disabled={isCreating}
              rows={4}
            />
          </div>
          
          <div>
            <Label className="text-cyan-400">Mission Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                  disabled={isCreating}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline ? formData.deadline.toLocaleDateString() : "Select mission deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600">
                <Calendar
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => setFormData({...formData, deadline: date})}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Abort
            </Button>
            <Button 
              type="submit" 
              className="bg-cyan-600 hover:bg-cyan-700"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                '🚀 Initialize Objective'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}