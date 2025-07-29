import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Clock, Users, Target, AlertTriangle, Save, Trash2, Link } from 'lucide-react';
import { useMissionData } from './MissionDataContext';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'BACKLOG' | 'TODAY' | 'DOING' | 'COMPLETED' | 'TOMORROW';
  limitDate?: Date | string;
  completedAt?: Date | string;
  details?: string;
  peopleHelp?: string[];
  timeNeeded?: number;
  purpose?: string;
  existing?: string;
  complexities?: string;
  resources?: any;
  estimatedTime?: number;
  complexity?: 'Simple' | 'Moderate' | 'Complex';
  tags?: string[];
  objectiveId?: string;
}

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskDetailModal({ open, onOpenChange, task, onSave, onDelete }: TaskDetailModalProps) {
  const missionData = useMissionData();
  const objectives = missionData.objectives.get();
  
  const [formData, setFormData] = useState<Task>(() => 
    task || {
      id: '',
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'BACKLOG',
      details: '',
      peopleHelp: [],
      timeNeeded: 0,
      purpose: '',
      existing: '',
      complexities: '',
      estimatedTime: 0,
      complexity: 'Moderate',
      tags: [],
      objectiveId: undefined
    }
  );

  const [newTag, setNewTag] = useState('');
  const [newPerson, setNewPerson] = useState('');

  React.useEffect(() => {
    if (task) {
      // Convert string dates to Date objects if needed
      const updatedTask = {
        ...task,
        limitDate: task.limitDate ? (typeof task.limitDate === 'string' ? new Date(task.limitDate) : task.limitDate) : undefined,
        completedAt: task.completedAt ? (typeof task.completedAt === 'string' ? new Date(task.completedAt) : task.completedAt) : undefined,
      };
      setFormData(updatedTask);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      console.log('TaskDetailModal: Submitting task data', formData);
      // Convert Date objects back to ISO strings for API
      const taskForSave = {
        ...formData,
        limitDate: formData.limitDate instanceof Date ? formData.limitDate.toISOString() : formData.limitDate,
        completedAt: formData.completedAt instanceof Date ? formData.completedAt.toISOString() : formData.completedAt,
      };
      console.log('TaskDetailModal: Task data for save', taskForSave);
      onSave(taskForSave);
    } else {
      console.warn('TaskDetailModal: No onSave handler provided');
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete && task) {
      console.log('TaskDetailModal: Deleting task', task.id);
      onDelete(task.id);
    } else {
      console.warn('TaskDetailModal: No onDelete handler or task provided');
    }
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
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
      case 'BACKLOG': return 'border-purple-400 text-purple-400';
      case 'TODAY': return 'border-green-400 text-green-400';
      case 'DOING': return 'border-blue-400 text-blue-400';
      case 'COMPLETED': return 'border-emerald-400 text-emerald-400';
      case 'TOMORROW': return 'border-indigo-400 text-indigo-400';
      default: return 'border-gray-400 text-gray-400';
    }
  };

  if (!open) return null;

  const connectedObjective = formData.objectiveId ? objectives.find(obj => obj.id === formData.objectiveId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-600 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {task ? 'Combat Objective Details' : 'Combat Objective Details'}
            {formData.status && (
              <Badge variant="outline" className={getStatusColor(formData.status)}>
                {formData.status}
              </Badge>
            )}
            {formData.priority && (
              <Badge className={getPriorityColor(formData.priority)}>
                {formData.priority}
              </Badge>
            )}
            {connectedObjective && (
              <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                <Link className="w-3 h-3 mr-1" />
                {connectedObjective.title}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">Mission Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter mission title..."
              className="bg-slate-800 border-slate-600 text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-white">Mission Brief</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Mission description..."
              className="bg-slate-800 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="priority" className="text-white">Priority Level</Label>
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
            <Label htmlFor="status" className="text-white">Mission Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-white">
                <SelectItem value="BACKLOG" className="text-white hover:bg-slate-600 focus:bg-slate-600">📋 Mission Backlog</SelectItem>
                <SelectItem value="TODAY" className="text-white hover:bg-slate-600 focus:bg-slate-600">⭐ Today's Missions</SelectItem>
                <SelectItem value="DOING" className="text-white hover:bg-slate-600 focus:bg-slate-600">🔥 Active Mission</SelectItem>
                <SelectItem value="COMPLETED" className="text-white hover:bg-slate-600 focus:bg-slate-600">✅ Mission Complete</SelectItem>
                <SelectItem value="TOMORROW" className="text-white hover:bg-slate-600 focus:bg-slate-600">🌅 Tomorrow's Missions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estimatedTime" className="text-white">Estimated Time (hours)</Label>
            <Input
              id="estimatedTime"
              type="number"
              value={formData.estimatedTime}
              onChange={(e) => setFormData({...formData, estimatedTime: Number(e.target.value)})}
              placeholder="0"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="complexity" className="text-white">Threat Level</Label>
            <Select value={formData.complexity} onValueChange={(value) => setFormData({...formData, complexity: value as any})}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-white">
                <SelectItem value="Simple" className="text-white hover:bg-slate-600 focus:bg-slate-600">🟢 Simple</SelectItem>
                <SelectItem value="Moderate" className="text-white hover:bg-slate-600 focus:bg-slate-600">🟡 Moderate</SelectItem>
                <SelectItem value="Complex" className="text-white hover:bg-slate-600 focus:bg-slate-600">🔴 Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="limitDate" className="text-white">Mission Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.limitDate ? 
                    (formData.limitDate instanceof Date ? 
                      formData.limitDate.toLocaleDateString() : 
                      new Date(formData.limitDate).toLocaleDateString()
                    ) : "Select deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600">
                <Calendar
                  mode="single"
                  selected={formData.limitDate instanceof Date ? formData.limitDate : formData.limitDate ? new Date(formData.limitDate) : undefined}
                  onSelect={(date) => setFormData({...formData, limitDate: date})}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="objective" className="text-white">Strategic Objective</Label>
            <Select value={formData.objectiveId || 'none'} onValueChange={(value) => setFormData({...formData, objectiveId: value === 'none' ? undefined : value})}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select objective (optional)">
                  {connectedObjective ? (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      {connectedObjective.title}
                    </div>
                  ) : (
                    "No objective selected"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-white">
                <SelectItem value="none" className="text-white hover:bg-slate-600 focus:bg-slate-600">No objective</SelectItem>
                {objectives
                  .filter(obj => obj.status === 'ACTIVE')
                  .map(objective => (
                    <SelectItem key={objective.id} value={objective.id}>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-cyan-400" />
                        {objective.title}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {connectedObjective?.deadline && (
              <p className="text-xs text-slate-500 mt-1">
                Objective deadline: {new Date(connectedObjective.deadline).toLocaleDateString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="purpose" className="text-white">Strategic Purpose</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              placeholder="What is this mission for?"
              className="bg-slate-800 border-slate-600 text-white"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="existing" className="text-white">Available Assets</Label>
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
            <Label htmlFor="complexities" className="text-white">Threat Assessment</Label>
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
            <Label className="text-white">Allied Support</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                placeholder="Add ally..."
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

          <div>
            <Label className="text-white">Mission Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add mission tag..."
                className="bg-slate-800 border-slate-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" className="border-slate-600">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="details" className="text-white">Intelligence Report</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => setFormData({...formData, details: e.target.value})}
              placeholder="Detailed notes, resources, links, intel, etc..."
              className="bg-slate-800 border-slate-600 text-white"
              rows={4}
            />
          </div>

          <div className="flex justify-between">
            <div>
              {task && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Abort Mission
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Mission
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 