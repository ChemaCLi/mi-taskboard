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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-cyan-400">Mission Objective</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Define strategic objective..."
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
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
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="text-cyan-400">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as any})} disabled={isLoading}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="ASAP">🔥 CRITICAL - ASAP</SelectItem>
                      <SelectItem value="HIGH">⚡ HIGH - Urgent</SelectItem>
                      <SelectItem value="MEDIUM">📋 MEDIUM - Standard</SelectItem>
                      <SelectItem value="LOW">🌱 LOW - When Possible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-cyan-400">Mission Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})} disabled={isLoading}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="ACTIVE">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" /> Active
                        </div>
                      </SelectItem>
                      <SelectItem value="ACHIEVED">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" /> Achieved
                        </div>
                      </SelectItem>
                      <SelectItem value="ABORTED">
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4" /> Aborted
                        </div>
                      </SelectItem>
                      <SelectItem value="INTERRUPTED">
                        <div className="flex items-center gap-2">
                          <Hand className="w-4 h-4" /> Interrupted
                        </div>
                      </SelectItem>
                      <SelectItem value="ARCHIVED">
                        <div className="flex items-center gap-2">
                          <Snowflake className="w-4 h-4" /> Archived
                        </div>
                      </SelectItem>
                      <SelectItem value="PAUSED">
                        <div className="flex items-center gap-2">
                          <Pause className="w-4 h-4" /> Paused
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="timeNeeded" className="text-cyan-400">Estimated Time (hours)</Label>
                <Input
                  id="timeNeeded"
                  type="number"
                  value={formData.timeNeeded}
                  onChange={(e) => setFormData({...formData, timeNeeded: Number(e.target.value)})}
                  placeholder="0"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="deadline" className="text-cyan-400">Mission Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deadline ? new Date(formData.deadline).toLocaleDateString() : "Select mission deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                    <Calendar
                      mode="single"
                      selected={formData.deadline instanceof Date ? formData.deadline : new Date(formData.deadline)}
                      onSelect={(date) => setFormData({...formData, deadline: date || new Date()})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>


            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="purpose" className="text-white">Purpose</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  placeholder="What is this objective for?"
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="existing" className="text-white">Existing Solutions</Label>
                <Textarea
                  id="existing"
                  value={formData.existing}
                  onChange={(e) => setFormData({...formData, existing: e.target.value})}
                  placeholder="What already exists that can help?"
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="complexities" className="text-white">Possible Complexities</Label>
                <Textarea
                  id="complexities"
                  value={formData.complexities}
                  onChange={(e) => setFormData({...formData, complexities: e.target.value})}
                  placeholder="What could go wrong or be complex?"
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-white">People Who Can Help</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newPerson}
                    onChange={(e) => setNewPerson(e.target.value)}
                    placeholder="Add person..."
                    className="bg-slate-800 border-slate-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPerson())}
                  />
                  <Button type="button" onClick={addPerson} variant="outline" className="border-slate-600">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.peopleHelp?.map((person) => (
                    <Badge key={person} variant="secondary" className="cursor-pointer" onClick={() => removePerson(person)}>
                      <Users className="w-3 h-3 mr-1" />
                      {person} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
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
                className="border-slate-600 text-white hover:bg-slate-700"
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