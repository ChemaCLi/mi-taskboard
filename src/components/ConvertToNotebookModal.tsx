import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Plus, X, FileText } from 'lucide-react';

interface ConvertToNotebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: string;
  onConvert: () => void;
}

export function ConvertToNotebookModal({ open, onOpenChange, notes, onConvert }: ConvertToNotebookModalProps) {
  const [metadata, setMetadata] = useState({
    project: '',
    date: new Date(),
    title: ''
  });
  
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormForm) => {
    e.preventDefault();
    console.log('Converting to notebook:', { metadata, tags, content: notes });
    onConvert();
    onOpenChange(false);
    setMetadata({ project: '', date: new Date(), title: '' });
    setTags([]);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-yellow-400" />
            Save to Virtual Notebook
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">Note Title</Label>
            <Input
              id="title"
              value={metadata.title}
              onChange={(e) => setMetadata({...metadata, title: e.target.value})}
              placeholder="Enter a title for this note..."
              className="bg-slate-800 border-slate-600 text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="project" className="text-white">Project Tag</Label>
            <Input
              id="project"
              value={metadata.project}
              onChange={(e) => setMetadata({...metadata, project: e.target.value})}
              placeholder="e.g. Dashboard Redesign"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
          
          <div>
            <Label className="text-white">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start bg-slate-800 border-slate-600 text-white">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {metadata.date.toLocaleDateString()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={metadata.date}
                  onSelect={(date) => date && setMetadata({...metadata, date})}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label className="text-white">Search Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="flex-1 bg-slate-800 border-slate-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-slate-800/50 rounded border border-slate-600">
            <Label className="text-white text-sm">Content Preview</Label>
            <div className="mt-2 text-slate-300 text-sm max-h-32 overflow-y-auto">
              {notes || 'No content to save'}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
              Save to Notebook
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}