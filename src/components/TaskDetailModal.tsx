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
import { useObjectiveContext } from './ObjectiveContext';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'BACKLOG' | 'TODAY' | 'DOING' | 'COMPLETED' | 'TOMORROW';
  limitDate?: Date;
  completedAt?: Date;
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
  const { objectives } = useObjectiveContext();
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
      setFormData(task);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete && task) {
      onDelete(task.id);
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
            {task ? 'Edit Task' : 'Task Details'}
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Task Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter task title..."
                  className="bg-slate-800 border-slate-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Task description..."
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="text-white">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as any})}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="ASAP">ASAP</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-white">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="BACKLOG">Backlog</SelectItem>
                      <SelectItem value="TODAY">Today</SelectItem>
                      <SelectItem value="DOING">Doing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="TOMORROW">Tomorrow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="complexity" className="text-white">Complexity</Label>
                  <Select value={formData.complexity} onValueChange={(value) => setFormData({...formData, complexity: value as any})}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="Simple">Simple</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Complex">Complex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="limitDate" className="text-white">Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.limitDate ? formData.limitDate.toLocaleDateString() : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                    <Calendar
                      mode="single"
                      selected={formData.limitDate}
                      onSelect={(date) => setFormData({...formData, limitDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="objective" className="text-white">Connected Objective</Label>
                <Select value={formData.objectiveId || ''} onValueChange={(value) => setFormData({...formData, objectiveId: value || undefined})}>
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
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="">No objective</SelectItem>
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
                {connectedObjective && (
                  <p className="text-xs text-slate-500 mt-1">
                    Objective deadline: {connectedObjective.deadline.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="purpose" className="text-white">Purpose</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  placeholder="What is this task for?"
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

              <div>
                <Label className="text-white">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
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
              {task && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
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
                Save Task
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 