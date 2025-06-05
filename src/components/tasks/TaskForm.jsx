
    import React, { useState, useCallback, useEffect } from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { DialogFooter } from '@/components/ui/dialog';
    import { toast } from '@/components/ui/use-toast';
    import { UploadCloud, Paperclip, XCircle } from 'lucide-react';

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const TaskForm = ({ task, onSubmit, users, onCancel }) => {
      const [title, setTitle] = useState('');
      const [description, setDescription] = useState('');
      const [assignee, setAssignee] = useState('');
      const [dueDate, setDueDate] = useState('');
      const [priority, setPriority] = useState('medium');
      const [status, setStatus] = useState('todo');
      const [attachments, setAttachments] = useState([]);
      const { user: currentUser } = useAuth();

      useEffect(() => {
        if (task) {
          setTitle(task.title || '');
          setDescription(task.description || '');
          setAssignee(task.assignee || '');
          setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
          setPriority(task.priority || 'medium');
          setStatus(task.status || 'todo');
          setAttachments(task.attachments || []);
        } else {
          setTitle('');
          setDescription('');
          setAssignee('');
          setDueDate('');
          setPriority('medium');
          setStatus('todo');
          setAttachments([]);
        }
      }, [task]);


      const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        const newAttachments = [];

        files.forEach(file => {
          if (file.size > MAX_FILE_SIZE) {
            toast({
              title: "File too large",
              description: `File "${file.name}" exceeds the 10MB limit.`,
              variant: "destructive",
            });
            return;
          }
          if (attachments.some(att => att.name === file.name) || newAttachments.some(att => att.name === file.name)) {
             toast({
              title: "Duplicate File",
              description: `File "${file.name}" is already attached.`,
              variant: "destructive",
            });
            return;
          }
          newAttachments.push({ name: file.name, size: file.size, type: file.type, content: 'placeholder_for_localstorage' });
        });
        
        if (newAttachments.length > 0) {
          setAttachments(prev => [...prev, ...newAttachments]);
        }
      };

      const handleRemoveAttachment = (fileName) => {
        setAttachments(prev => prev.filter(file => file.name !== fileName));
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!title) {
          toast({ title: "Validation Error", description: "Task title is required.", variant: "destructive"});
          return;
        }
        onSubmit({ title, description, assignee, dueDate, priority, status, attachments });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Finalize Q3 report" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description of the task" />
          </div>
          
          <div>
            <Label htmlFor="assignee">Assign To</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user to assign" />
              </SelectTrigger>
              <SelectContent>
                {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
           <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          <div>
            <Label htmlFor="attachments">Attachments (Max 10MB each)</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="flex text-sm text-muted-foreground">
                  <Label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  >
                    <span>Upload files</span>
                    <Input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                  </Label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, PDF, DOCX, etc. up to 10MB</p>
              </div>
            </div>
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label>Uploaded files:</Label>
                <ul className="divide-y divide-border rounded-md border">
                  {attachments.map((file, index) => (
                    <li key={index} className="flex items-center justify-between py-2 px-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span>{file.name}</span>
                        <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAttachment(file.name)}>
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{task ? 'Update Task' : 'Create Task'}</Button>
          </DialogFooter>
        </form>
      );
    };

    export default TaskForm;
  