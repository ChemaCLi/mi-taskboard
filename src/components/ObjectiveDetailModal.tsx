import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Target, Users, Save, Trash2, Clock, Star, X, Hand, Snowflake, Pause, Loader2 } from 'lucide-react';
import { useMissionData } from './MissionDataContext';

interface Objective {
  id: string;
  title: string;
  description?: string;
  deadline: Date | string;
  status: 'ACTIVE' | 'ACHIEVED' | 'ABORTED' | 'INTERRUPTED' | 'ARCHIVED' | 'PAUSED';
  priority?: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  details?: string;
  peopleHelp?: string[];
  timeNeeded?: number;
  purpose?: string;
  existing?: string;
  complexities?: string;
  resources?: any;
  createdAt?: Date | string;
}

interface ObjectiveDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objective: Objective | null;
  onSave?: (objective: Objective) => void;
  onDelete?: (objectiveId: string) => void;
}

export function ObjectiveDetailModal({ open, onOpenChange, objective, onSave, onDelete }: ObjectiveDetailModalProps) {
  const missionData = useMissionData();
  const [formData, setFormData] = useState<Objective>(() => 
    objective || {
      id: '',
      title: '',
      description: '',
      deadline: new Date(),
      status: 'ACTIVE',
      priority: 'MEDIUM',
      details: '',
      peopleHelp: [],
      timeNeeded: 0,
      purpose: '',
      existing: '',
      complexities: ''
    }
  );

  const [newPerson, setNewPerson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (objective) {
      // Convert string dates to Date objects if needed
      const updatedObjective = {
        ...objective,
        deadline: objective.deadline ? (typeof objective.deadline === 'string' ? new Date(objective.deadline) : objective.deadline) : new Date(),
        createdAt: objective.createdAt ? (typeof objective.createdAt === 'string' ? new Date(objective.createdAt) : objective.createdAt) : undefined,
      };
      setFormData(updatedObjective);
    }
    setError(null);
  }, [objective]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('ObjectiveDetailModal: Submitting objective data', formData);
      
      // Convert Date objects back to ISO strings for API
      const objectiveForSave = {
        ...formData,
        deadline: formData.deadline instanceof Date ? formData.deadline.toISOString() : formData.deadline,
        createdAt: formData.createdAt instanceof Date ? formData.createdAt.toISOString() : formData.createdAt,
      };
      
      console.log('ObjectiveDetailModal: Objective data for save', objectiveForSave);

      if (onSave) {
        await onSave(objectiveForSave);
      } else {
        console.warn('ObjectiveDetailModal: No onSave handler provided');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving objective:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!objective) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('ObjectiveDetailModal: Deleting objective', objective.id);
      
      if (onDelete) {
        await onDelete(objective.id);
      } else {
        console.warn('ObjectiveDetailModal: No onDelete handler provided');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting objective:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addPerson = () => {
    if (newPerson.trim() && !formData.peopleHelp?.includes(newPerson.trim())) {
      setFormData({
        ...formData,
        peopleHelp: [...(formData.peopleHelp || []), newPerson.trim()]
      });
      setNewPerson('');
    }
  };

  const removePerson = (personToRemove: string) => {
    setFormData({
      ...formData,
      peopleHelp: formData.peopleHelp?.filter(person => person !== personToRemove) || []
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ASAP': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-600 text-white';
      case 'MEDIUM': return 'bg-yellow-600 text-black';
      case 'LOW': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'border-blue-400 text-blue-400';
      case 'ACHIEVED': return 'border-green-400 text-green-400';
      case 'ABORTED': return 'border-red-400 text-red-400';
      case 'INTERRUPTED': return 'border-orange-400 text-orange-400';
      case 'ARCHIVED': return 'border-slate-400 text-slate-400';
      case 'PAUSED': return 'border-yellow-400 text-yellow-400';
      default: return 'border-gray-400 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Target className="w-4 h-4" />;
      case 'ACHIEVED': return <Star className="w-4 h-4" />;
      case 'ABORTED': return <X className="w-4 h-4" />;
      case 'INTERRUPTED': return <Hand className="w-4 h-4" />;
      case 'ARCHIVED': return <Snowflake className="w-4 h-4" />;
      case 'PAUSED': return <Pause className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getDeadlineStatus = (objective: Objective) => {
    if (!objective.createdAt) return { color: 'gray', status: 'Unknown', daysRemaining: 0 };
    
    const now = new Date();
    const deadline = new Date(objective.deadline);
    const createdAt = new Date(objective.createdAt);
    
    const totalTime = deadline.getTime() - createdAt.getTime();
    const elapsed = now.getTime() - createdAt.getTime();
    const progress = elapsed / totalTime;
    
    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (progress <= 1/3) {
      return { color: 'green', status: 'On Track', daysRemaining };
    } else if (progress <= 2/3) {
      return { color: 'yellow', status: 'Caution', daysRemaining };
    } else {
      return { color: 'red', status: 'Critical', daysRemaining };
    }
  };

  if (!open) return null;

  const deadlineStatus = formData.createdAt ? getDeadlineStatus(formData) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-600 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            🎯 {objective ? 'Strategic Objective Control' : 'Objective Details'}
            {formData.priority && (
              <Badge className={getPriorityColor(formData.priority)}>
                {formData.priority}
              </Badge>
            )}
            <Badge variant="outline" className={getStatusColor(formData.status)}>
              {getStatusIcon(formData.status)}
              <span className="ml-1">{formData.status}</span>
            </Badge>
            {deadlineStatus && (
              <Badge variant="outline" className={`
                ${deadlineStatus.color === 'green' ? 'border-green-400 text-green-400' : ''}
                ${deadlineStatus.color === 'yellow' ? 'border-yellow-400 text-yellow-400' : ''}
                ${deadlineStatus.color === 'red' ? 'border-red-400 text-red-400' : ''}
              `}>
                {deadlineStatus.daysRemaining}d - {deadlineStatus.status}
              </Badge>
            )}
          </DialogTitle>
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
              placeholder="Enter strategic objective..."
              className="bg-slate-800 border-slate-600 text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-cyan-400">Strategic Brief</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed description of the strategic objective..."
              className="bg-slate-800 border-slate-600 text-white"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="priority" className="text-cyan-400">Priority Level</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as any})}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-white">
                <SelectItem value="ASAP" className="text-white hover:bg-slate-600 focus:bg-slate-600">🔴 ASAP - Critical</SelectItem>
                <SelectItem value="HIGH" className="text-white hover:bg-slate-600 focus:bg-slate-600">🟠 High Priority</SelectItem>
                <SelectItem value="MEDIUM" className="text-white hover:bg-slate-600 focus:bg-slate-600">🟡 Medium Priority</SelectItem>
                <SelectItem value="LOW" className="text-white hover:bg-slate-600 focus:bg-slate-600">🟢 Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="status" className="text-cyan-400">Mission Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-white">
                <SelectItem value="ACTIVE" className="text-white hover:bg-slate-600 focus:bg-slate-600">🎯 Active Mission</SelectItem>
                <SelectItem value="ACHIEVED" className="text-white hover:bg-slate-600 focus:bg-slate-600">⭐ Mission Achieved</SelectItem>
                <SelectItem value="ABORTED" className="text-white hover:bg-slate-600 focus:bg-slate-600">❌ Mission Aborted</SelectItem>
                <SelectItem value="INTERRUPTED" className="text-white hover:bg-slate-600 focus:bg-slate-600">⏸️ Mission Interrupted</SelectItem>
                <SelectItem value="ARCHIVED" className="text-white hover:bg-slate-600 focus:bg-slate-600">📦 Mission Archived</SelectItem>
                <SelectItem value="PAUSED" className="text-white hover:bg-slate-600 focus:bg-slate-600">⏸️ Mission Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="deadline" className="text-cyan-400">Mission Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline ? 
                    (formData.deadline instanceof Date ? 
                      formData.deadline.toLocaleDateString() : 
                      new Date(formData.deadline).toLocaleDateString()
                    ) : "Select deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600">
                <Calendar
                  mode="single"
                  selected={formData.deadline instanceof Date ? formData.deadline : formData.deadline ? new Date(formData.deadline) : undefined}
                  onSelect={(date) => setFormData({...formData, deadline: date || new Date()})}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label htmlFor="timeNeeded" className="text-cyan-400">Estimated Time (hours)</Label>
            <Input
              id="timeNeeded"
              type="number"
              value={formData.timeNeeded}
              onChange={(e) => setFormData({...formData, timeNeeded: Number(e.target.value)})}
              placeholder="e.g. 40"
              className="bg-slate-800 border-slate-600 text-white"
              min="0"
              step="0.5"
            />
          </div>
          
          <div>
            <Label htmlFor="purpose" className="text-cyan-400">Strategic Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              placeholder="Why is this objective critical to our mission?"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="existing" className="text-cyan-400">Available Assets</Label>
            <Input
              id="existing"
              value={formData.existing}
              onChange={(e) => setFormData({...formData, existing: e.target.value})}
              placeholder="Existing resources, tools, or progress that can be leveraged"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="complexities" className="text-cyan-400">Threat Assessment</Label>
            <Textarea
              id="complexities"
              value={formData.complexities}
              onChange={(e) => setFormData({...formData, complexities: e.target.value})}
              placeholder="Potential challenges, blockers, or risk factors..."
              className="bg-slate-800 border-slate-600 text-white"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="resources" className="text-cyan-400">Intelligence Resources</Label>
            <Textarea
              id="resources"
              value={formData.resources}
              onChange={(e) => setFormData({...formData, resources: e.target.value})}
              placeholder="Links, file paths, documentation, or resource descriptions..."
              className="bg-slate-800 border-slate-600 text-white"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="peopleHelp" className="text-cyan-400">Allied Support</Label>
            <Input
              id="peopleHelp"
              value={formData.peopleHelp?.join(', ') || ''}
              onChange={(e) => setFormData({...formData, peopleHelp: e.target.value.split(',').map(p => p.trim()).filter(Boolean)})}
              placeholder="Names, roles, or contacts who can assist (comma-separated)"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="details" className="text-white">Additional Details</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => setFormData({...formData, details: e.target.value})}
              placeholder="Detailed notes, resources, links, etc..."
              className="bg-slate-800 border-slate-600 text-white"
              rows={4}
            />
          </div>

          <div className="flex justify-between">
            <div>
              {objective && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  🗑️ Abort Mission
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500 hover:border-slate-400"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    💾 Update Objective
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 