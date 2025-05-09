
    import React, { useState, useMemo } from 'react';
    import { useData } from '@/contexts/DataContext';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { PlusCircle, Edit2, Trash2, StickyNote, Search } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { toast } from '@/components/ui/use-toast';

    const NoteForm = ({ note, onSubmit, onCancel }) => {
      const [title, setTitle] = useState(note?.title || '');
      const [content, setContent] = useState(note?.content || '');

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!title) {
          toast({ title: "Validation Error", description: "Note title is required.", variant: "destructive"});
          return;
        }
        onSubmit({ title, content });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Meeting Minutes - Q3 Planning" />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your notes here..." rows={10} />
          </div>
          <DialogFooter>
             <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{note ? 'Update Note' : 'Create Note'}</Button>
          </DialogFooter>
        </form>
      );
    };

    const NoteCard = ({ note, onEdit, onDelete, onView }) => {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full flex flex-col"
        >
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col flex-grow">
            <CardHeader className="cursor-pointer" onClick={() => onView(note)}>
              <CardTitle className="text-lg truncate">{note.title}</CardTitle>
              <CardDescription>Last updated: {new Date(note.updatedAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow cursor-pointer" onClick={() => onView(note)}>
              <p className="text-sm text-muted-foreground line-clamp-4">{note.content || "No content yet."}</p>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end space-x-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(note)}><Edit2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(note.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };
    
    const NoteViewDialog = ({ note, open, onOpenChange }) => {
      if (!note) return null;
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl">{note.title}</DialogTitle>
              <DialogDescription>
                Last updated: {new Date(note.updatedAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 overflow-y-auto flex-grow">
              <pre className="whitespace-pre-wrap break-words text-sm font-sans">{note.content}</pre>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };


    const NotesPage = () => {
      const { notes, createNote, updateNote, deleteNote } = useData();
      const { user } = useAuth();
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingNote, setEditingNote] = useState(null);
      const [viewingNote, setViewingNote] = useState(null);
      const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
      const [searchTerm, setSearchTerm] = useState('');


      const userNotes = useMemo(() => {
        return notes
          .filter(n => n.userId === user.id && 
                       (n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        n.content.toLowerCase().includes(searchTerm.toLowerCase())))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      }, [notes, user.id, searchTerm]);

      const handleCreateNote = (noteData) => {
        createNote(noteData);
        setIsFormOpen(false);
      };

      const handleUpdateNote = (noteData) => {
        if (editingNote) {
          updateNote(editingNote.id, noteData);
        }
        setEditingNote(null);
        setIsFormOpen(false);
      };

      const handleEdit = (note) => {
        setEditingNote(note);
        setIsFormOpen(true);
      };

      const handleDelete = (noteId) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            deleteNote(noteId);
        }
      };
      
      const handleView = (note) => {
        setViewingNote(note);
        setIsViewDialogOpen(true);
      };

      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingNote(null); }}>
              <DialogTrigger asChild>
                <Button onClick={() => {setEditingNote(null); setIsFormOpen(true);}}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
                  <DialogDescription>
                    {editingNote ? 'Update your note details.' : 'Add a new note to your collection.'}
                  </DialogDescription>
                </DialogHeader>
                <NoteForm 
                  note={editingNote} 
                  onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
                  onCancel={() => { setIsFormOpen(false); setEditingNote(null);}}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full md:w-1/2 lg:w-1/3"
            />
          </div>


          {userNotes.length === 0 && !searchTerm ? (
            <div className="text-center py-10">
              <StickyNote className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-xl font-semibold">No notes yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Click "Create New Note" to jot down your thoughts.
              </p>
            </div>
          ) : userNotes.length === 0 && searchTerm ? (
             <div className="text-center py-10">
              <Search className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-xl font-semibold">No notes found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {userNotes.map(note => (
                  <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} onView={handleView}/>
                ))}
              </AnimatePresence>
            </div>
          )}
          <NoteViewDialog note={viewingNote} open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} />
        </div>
      );
    };

    export default NotesPage;
  