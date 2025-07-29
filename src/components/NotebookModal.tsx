import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BookOpen, Trash2, FileText, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { useMissionData } from './MissionDataContext';

interface Note {
  id: string;
  title?: string;
  content: string;
  project?: string;
  tags: string[];
  isNotebook: boolean;
  notebookDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface NotebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteSelect: (note: Note) => void;
  currentNoteId?: string;
}

export function NotebookModal({ open, onOpenChange, onNoteSelect, currentNoteId }: NotebookModalProps) {
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const missionData = useMissionData();

  // Get all notes and filter for notebook notes, sort by creation date (newest first)
  const allNotes = missionData.notes.get();
  const notebookNotes = allNotes
    .filter(note => note.isNotebook)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleNoteClick = async (note: Note) => {
    // Close modal and let parent handle the note loading
    onNoteSelect(note);
    onOpenChange(false);
  };

  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent note selection when clicking delete
    
    setDeletingNoteId(noteId);
    try {
      await missionData.notes.delete(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setDeletingNoteId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPreviewText = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-600 max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-400" />
            Neural Archive Vault
            {missionData.notes.isLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col max-h-[60vh]">
          {missionData.notes.error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">Error loading notes</span>
              </div>
            </div>
          )}

          {missionData.notes.isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading neural archives...
            </div>
          ) : notebookNotes.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No archived notes found</p>
              <p className="text-xs text-slate-500 mt-1">Use "To Notebook" to archive your current note</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto pr-2">
              {notebookNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-slate-800/70 ${
                    note.id === currentNoteId 
                      ? 'border-yellow-400/50 bg-yellow-400/10' 
                      : 'border-slate-600 bg-slate-800/30'
                  }`}
                  onClick={() => handleNoteClick(note)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <h3 className="font-medium text-white text-sm">
                          {note.title || formatDateTime(note.createdAt)}
                        </h3>
                        {note.id === currentNoteId && (
                          <Badge variant="outline" className="border-yellow-400 text-yellow-400 text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      
                      {note.content && (
                        <p className="text-slate-300 text-sm mb-2 line-clamp-2">
                          {getPreviewText(note.content)}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Updated {formatDateTime(note.updatedAt)}</span>
                        </div>
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex gap-1">
                            {note.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-slate-500 text-slate-400">
                                {tag}
                              </Badge>
                            ))}
                            {note.tags.length > 2 && (
                              <span className="text-slate-500">+{note.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      disabled={deletingNoteId === note.id}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 ml-2 flex-shrink-0"
                    >
                      {deletingNoteId === note.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-600">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            Close Archive
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 