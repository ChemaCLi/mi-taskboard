import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { BookOpen, Plus, FileText, ArrowRight } from 'lucide-react';
import { ConvertToNotebookModal } from './ConvertToNotebookModal';
import { CreateTaskFromTextModal } from './CreateTaskFromTextModal';

export function NotesCard() {
  const [notes, setNotes] = useState('• Review the new design mockups\n• Check competitor analysis report\n• Schedule user interviews for next week\n• Update project timeline\n• Research new authentication methods');
  const [selectedText, setSelectedText] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNotebookModal, setShowNotebookModal] = useState(false);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedText) {
      setShowTaskModal(true);
    }
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-yellow-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-yellow-400">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Quick Notes
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowNotebookModal(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-black"
            >
              <FileText className="w-4 h-4 mr-1" />
              To Notebook
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onMouseUp={handleTextSelection}
              onContextMenu={handleContextMenu}
              placeholder="Jot down quick thoughts, ideas, or reminders..."
              className="min-h-32 bg-slate-700/50 border-slate-600 text-white resize-none"
            />
            
            {selectedText && (
              <div className="p-2 bg-yellow-400/10 rounded border border-yellow-400/30">
                <p className="text-yellow-400 text-xs mb-1">Selected text:</p>
                <p className="text-white text-sm mb-2">"{selectedText}"</p>
                <Button 
                  size="sm" 
                  onClick={() => setShowTaskModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Create Task
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Badge variant="outline" className="border-yellow-400/50 text-yellow-400">
                Tip
              </Badge>
              <span>Right-click selected text to create a task</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateTaskFromTextModal 
        open={showTaskModal} 
        onOpenChange={setShowTaskModal}
        selectedText={selectedText}
        onClose={() => setSelectedText('')}
      />

      <ConvertToNotebookModal 
        open={showNotebookModal} 
        onOpenChange={setShowNotebookModal}
        notes={notes}
        onConvert={() => setNotes('')}
      />
    </>
  );
}