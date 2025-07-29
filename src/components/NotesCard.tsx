import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { BookOpen, FileText, Archive, Loader2, AlertTriangle, Save, Plus } from 'lucide-react';
import { useMissionData } from './MissionDataContext';
import { NotebookModal } from './NotebookModal';

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

export function NotesCard() {
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isMovingToNotebook, setIsMovingToNotebook] = useState(false);
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isCreatingFirstNote, setIsCreatingFirstNote] = useState(false);
  const [showAddNoteButton, setShowAddNoteButton] = useState(false);
  
  const missionData = useMissionData();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);

  // Initialize with an active note (not notebook note) or show add note button
  useEffect(() => {
    const initializeNote = () => {
      const allNotes = missionData.notes.get();
      
      // Find the most recently updated active note (not a notebook note)
      const activeNotes = allNotes
        .filter(note => !note.isNotebook)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      if (activeNotes.length > 0) {
        const note = activeNotes[0];
        setCurrentNote(note);
        setContent(note.content);
        setShowAddNoteButton(false);
      } else {
        // No active notes exist - show the add note button
        setCurrentNote(null);
        setContent('');
        setShowAddNoteButton(true);
      }
    };

    if (missionData.notes.get().length >= 0 && !currentNote && !isCreatingFirstNote) {
      initializeNote();
    }
  }, [missionData.notes.get().length, currentNote, isCreatingFirstNote]);

  // Create a new note
  const createNewNote = async (): Promise<Note | null> => {
    try {
      const newNoteData = {
        content: '',
        isNotebook: false,
        tags: [],
        project: undefined,
        title: undefined
      };
      
      const createdNote = await missionData.notes.create(newNoteData);
      if (createdNote) {
        setCurrentNote(createdNote);
        setContent('');
        hasUnsavedChanges.current = false;
        setShowAddNoteButton(false);
        return createdNote;
      }
    } catch (error) {
      console.error('Error creating new note:', error);
    }
    return null;
  };

  // Handle first note creation from button
  const handleAddFirstNote = async () => {
    setIsCreatingFirstNote(true);
    try {
      await createNewNote();
    } catch (error) {
      console.error('Error creating first note:', error);
    } finally {
      setIsCreatingFirstNote(false);
    }
  };

  // Debounced save function
  const debouncedSave = useCallback(async (noteContent: string) => {
    if (!currentNote || !hasUnsavedChanges.current) return;

    setIsSaving(true);
    try {
      const updatedNote = await missionData.notes.update(currentNote.id, {
        content: noteContent
      });
      
      if (updatedNote) {
        setCurrentNote(updatedNote);
        setLastSaveTime(new Date());
        hasUnsavedChanges.current = false;
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentNote, missionData.notes]);

  // Handle content changes with debounce
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    hasUnsavedChanges.current = true;

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for 500ms
    debounceTimeoutRef.current = setTimeout(() => {
      debouncedSave(newContent);
    }, 500);
  };

  // Save immediately (for manual save or before notebook operations)
  const saveImmediately = async (): Promise<boolean> => {
    if (!currentNote || !hasUnsavedChanges.current) return true;

    // Clear any pending debounced save
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    setIsSaving(true);
    try {
      const updatedNote = await missionData.notes.update(currentNote.id, {
        content: content
      });
      
      if (updatedNote) {
        setCurrentNote(updatedNote);
        setLastSaveTime(new Date());
        hasUnsavedChanges.current = false;
        return true;
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  // Move current note to notebook and create new active note
  const handleToNotebook = async () => {
    if (!currentNote) return;

    setIsMovingToNotebook(true);
    try {
      // First, save current changes
      await saveImmediately();

      // Move current note to notebook
      await missionData.notes.update(currentNote.id, {
        isNotebook: true,
        notebookDate: new Date().toISOString()
      });

      // Create a new empty note
      await createNewNote();
    } catch (error) {
      console.error('Error moving note to notebook:', error);
    } finally {
      setIsMovingToNotebook(false);
    }
  };

  // Handle note selection from notebook
  const handleNoteSelect = async (selectedNote: Note) => {
    // Save current note before switching
    await saveImmediately();

    // Load the selected note
    setCurrentNote(selectedNote);
    setContent(selectedNote.content);
    setShowAddNoteButton(false);
    hasUnsavedChanges.current = false;
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const formatLastSaveTime = () => {
    if (!lastSaveTime) return '';
    return lastSaveTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-yellow-400/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-yellow-400" />
              Neural Notes Interface
              {(isSaving || missionData.notes.isLoading) && (
                <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => setShowNotebookModal(true)}
                className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
              >
                <Archive className="w-4 h-4 mr-1" />
                Notebook
              </Button>
              {currentNote && (
                <Button 
                  size="sm" 
                  onClick={handleToNotebook}
                  disabled={isMovingToNotebook || !currentNote}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black"
                >
                  {isMovingToNotebook ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Archiving...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-1" />
                      To Notebook
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {missionData.notes.error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">Error loading notes</span>
              </div>
            </div>
          )}

          {showAddNoteButton ? (
            // Show "Add a note" button when no notes exist
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-yellow-400/50" />
                <h3 className="text-lg font-medium text-white mb-2">Neural Archive Empty</h3>
                <p className="text-sm text-slate-400 mb-6">
                  No active notes found. Create your first neural entry to begin.
                </p>
              </div>
              <Button
                onClick={handleAddFirstNote}
                disabled={isCreatingFirstNote}
                className="bg-yellow-600 hover:bg-yellow-700 text-black px-6 py-3 text-base"
              >
                {isCreatingFirstNote ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Initializing Neural Interface...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add a Note
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Show text area when note exists
            <div className="space-y-3">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing your neural thoughts..."
                disabled={isMovingToNotebook || !currentNote}
                className="min-h-[200px] bg-slate-700/50 border-yellow-400/30 text-white placeholder:text-slate-400 resize-none focus:border-yellow-400"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  {currentNote && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>Note ID: {currentNote.id.slice(-8)}</span>
                    </div>
                  )}
                  {lastSaveTime && (
                    <div className="flex items-center gap-1">
                      <Save className="w-3 h-3" />
                      <span>Last saved: {formatLastSaveTime()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {isSaving && (
                    <Badge variant="outline" className="border-yellow-400 text-yellow-400 text-xs">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Saving...
                    </Badge>
                  )}
                  {hasUnsavedChanges.current && !isSaving && (
                    <Badge variant="outline" className="border-orange-400 text-orange-400 text-xs">
                      Unsaved changes
                    </Badge>
                  )}
                  {!hasUnsavedChanges.current && !isSaving && lastSaveTime && (
                    <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                      Saved
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <NotebookModal
        open={showNotebookModal}
        onOpenChange={setShowNotebookModal}
        onNoteSelect={handleNoteSelect}
        currentNoteId={currentNote?.id}
      />
    </>
  );
}