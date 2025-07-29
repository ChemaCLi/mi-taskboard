import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Plus, X, Loader2 } from 'lucide-react';
import { useMissionData } from './MissionDataContext';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskModal({ open, onOpenChange }: CreateTaskModalProps) {
  const missionData = useMissionData();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW',
    limitDate: undefined as Date | undefined,
    timeNeeded: '',
    people: '',
    purpose: '',
    existing: '',
    complexities: '',
    resources: ''
  });
  
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      // Prepare the task data for the API
      const taskData = {
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        status: 'BACKLOG' as const,
        limitDate: formData.limitDate ? formData.limitDate.toISOString() : undefined,
        timeNeeded: formData.timeNeeded ? parseInt(formData.timeNeeded) : undefined,
        peopleHelp: formData.people ? formData.people.split(',').map(p => p.trim()).filter(Boolean) : undefined,
        purpose: formData.purpose || undefined,
        existing: formData.existing || undefined,
        complexities: formData.complexities || undefined,
        resources: formData.resources ? {
          description: formData.resources,
          // Could be expanded to parse actual resource links/files
        } : undefined,
      };

      console.log('Creating task with data:', taskData);

      const newTask = await missionData.tasks.create(taskData);
      
      if (newTask) {
        console.log('Task created successfully:', newTask);
        onOpenChange(false);
        resetForm();
      } else {
        setError('Failed to create task. Please try again.');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      limitDate: undefined,
      timeNeeded: '',
      people: '',
      purpose: '',
      existing: '',
      complexities: '',
      resources: ''
    });
    setTags([]);
    setError(null);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isCreating && onOpenChange(isOpen)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            Create New Combat Objective
            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title" className="text-white">Mission Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter mission objective..."
                className="bg-slate-800 border-slate-600 text-white"
                required
                disabled={isCreating}
              />
            </div>
            
            <div>
              <Label htmlFor="priority" className="text-white">Priority Level</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW') => setFormData({...formData, priority: value})}
                disabled={isCreating}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASAP">🔴 ASAP - Critical</SelectItem>
                  <SelectItem value="HIGH">🟠 High Priority</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Medium Priority</SelectItem>
                  <SelectItem value="LOW">🟢 Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timeNeeded" className="text-white">Estimated Time (hours)</Label>
              <Input
                id="timeNeeded"
                type="number"
                value={formData.timeNeeded}
                onChange={(e) => setFormData({...formData, timeNeeded: e.target.value})}
                placeholder="e.g. 2.5"
                className="bg-slate-800 border-slate-600 text-white"
                min="0"
                step="0.5"
                disabled={isCreating}
              />
            </div>
            
            <div className="col-span-2">
              <Label className="text-white">Mission Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-slate-800 border-slate-600 text-white"
                    disabled={isCreating}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.limitDate ? formData.limitDate.toLocaleDateString() : "Select deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.limitDate}
                    onSelect={(date) => setFormData({...formData, limitDate: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-white">Mission Brief</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed description of the mission objective..."
              className="bg-slate-800 border-slate-600 text-white"
              rows={3}
              disabled={isCreating}
            />
          </div>
          
          <div>
            <Label htmlFor="people" className="text-white">Allied Support</Label>
            <Input
              id="people"
              value={formData.people}
              onChange={(e) => setFormData({...formData, people: e.target.value})}
              placeholder="Names, roles, or contacts who can assist (comma-separated)"
              className="bg-slate-800 border-slate-600 text-white"
              disabled={isCreating}
            />
          </div>
          
          <div>
            <Label htmlFor="purpose" className="text-white">Strategic Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              placeholder="Why is this mission critical to our objectives?"
              className="bg-slate-800 border-slate-600 text-white"
              disabled={isCreating}
            />
          </div>
          
          <div>
            <Label htmlFor="existing" className="text-white">Available Assets</Label>
            <Input
              id="existing"
              value={formData.existing}
              onChange={(e) => setFormData({...formData, existing: e.target.value})}
              placeholder="Existing resources, tools, or progress that can be leveraged"
              className="bg-slate-800 border-slate-600 text-white"
              disabled={isCreating}
            />
          </div>
          
          <div>
            <Label htmlFor="complexities" className="text-white">Threat Assessment</Label>
            <Textarea
              id="complexities"
              value={formData.complexities}
              onChange={(e) => setFormData({...formData, complexities: e.target.value})}
              placeholder="Potential challenges, blockers, or risk factors..."
              className="bg-slate-800 border-slate-600 text-white"
              rows={2}
              disabled={isCreating}
            />
          </div>
          
          <div>
            <Label htmlFor="resources" className="text-white">Intelligence Resources</Label>
            <Textarea
              id="resources"
              value={formData.resources}
              onChange={(e) => setFormData({...formData, resources: e.target.value})}
              placeholder="Links, file paths, documentation, or resource descriptions..."
              className="bg-slate-800 border-slate-600 text-white"
              rows={2}
              disabled={isCreating}
            />
          </div>
          
          <div>
            <Label className="text-white">Mission Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a mission tag..."
                className="flex-1 bg-slate-800 border-slate-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                disabled={isCreating}
              />
              <Button 
                type="button" 
                onClick={addTag} 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isCreating}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => !isCreating && removeTag(tag)} 
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancel Mission
            </Button>
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isCreating || !formData.title.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                'Deploy Mission'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}