
    import React, { createContext, useContext, useState, useEffect } from 'react';
    import { useLocalStorage } from '@/hooks/useLocalStorage';
    import { useAuth } from '@/contexts/AuthContext';
    import { toast } from '@/components/ui/use-toast';

    const DataContext = createContext(null);

    const initialUsers = [
      { id: 'admin001', name: 'Admin User', email: 'admin@example.com', role: 'admin', createdAt: new Date().toISOString() },
      { id: 'user001', name: 'Regular User', email: 'user@example.com', role: 'user', createdAt: new Date().toISOString() },
      { id: 'user002', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'user', createdAt: new Date().toISOString() },
      { id: 'user003', name: 'John Smith', email: 'john.smith@example.com', role: 'user', createdAt: new Date().toISOString() },
    ];
    
    export const DataProvider = ({ children }) => {
      const { user } = useAuth();
      const [tasks, setTasks] = useLocalStorage('tasks', []);
      const [reminders, setReminders] = useLocalStorage('reminders', []);
      const [notes, setNotes] = useLocalStorage('notes', []);
      const [users, setUsers] = useLocalStorage('users', initialUsers);


      const generateId = () => new Date().getTime().toString();

      const createTask = (taskData) => {
        const newTask = { 
          id: generateId(), 
          ...taskData, 
          status: taskData.status || 'todo', 
          createdAt: new Date().toISOString(),
          createdBy: user.id,
          attachments: taskData.attachments || [],
        };
        setTasks(prev => [...prev, newTask]);
        toast({ title: "Task Created", description: `Task "${newTask.title}" has been successfully created.` });
        return newTask;
      };

      const updateTask = (taskId, updates) => {
        setTasks(prev => prev.map(task => task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task));
        toast({ title: "Task Updated", description: `Task has been successfully updated.` });
      };

      const deleteTask = (taskId) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        toast({ title: "Task Deleted", description: "Task has been successfully deleted.", variant: "destructive" });
      };
      
      const createReminder = (reminderData) => {
        const newReminder = { 
          id: generateId(), 
          ...reminderData, 
          userId: user.id, 
          createdAt: new Date().toISOString() 
        };
        setReminders(prev => [...prev, newReminder]);
        toast({ title: "Reminder Set", description: `Reminder "${newReminder.title}" has been set.` });
        return newReminder;
      };

      const updateReminder = (reminderId, updates) => {
        setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
        toast({ title: "Reminder Updated", description: "Reminder has been successfully updated." });
      };
      
      const deleteReminder = (reminderId) => {
        setReminders(prev => prev.filter(r => r.id !== reminderId));
        toast({ title: "Reminder Deleted", description: "Reminder has been successfully deleted.", variant: "destructive" });
      };

      const createNote = (noteData) => {
        const newNote = { 
          id: generateId(), 
          ...noteData, 
          userId: user.id, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setNotes(prev => [...prev, newNote]);
        toast({ title: "Note Created", description: `Note "${newNote.title}" has been saved.` });
        return newNote;
      };

      const updateNote = (noteId, updates) => {
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
        toast({ title: "Note Updated", description: "Note has been successfully updated." });
      };

      const deleteNote = (noteId) => {
        setNotes(prev => prev.filter(n => n.id !== noteId));
        toast({ title: "Note Deleted", description: "Note has been successfully deleted.", variant: "destructive" });
      };

      const createUser = (userData) => {
        if (user?.role !== 'admin') {
          toast({ title: "Permission Denied", description: "Only admins can create users.", variant: "destructive" });
          return null;
        }
        const newUser = { id: generateId(), ...userData, createdAt: new Date().toISOString() };
        setUsers(prev => [...prev, newUser]);
        toast({ title: "User Created", description: `User "${newUser.name}" has been created.` });
        return newUser;
      };
    
      const updateUser = (userId, updates) => {
        if (user?.role !== 'admin') {
          toast({ title: "Permission Denied", description: "Only admins can update users.", variant: "destructive" });
          return;
        }
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
        toast({ title: "User Updated", description: "User details have been updated." });
      };
    
      const deleteUser = (userId) => {
        if (user?.role !== 'admin') {
          toast({ title: "Permission Denied", description: "Only admins can delete users.", variant: "destructive" });
          return;
        }
        if (userId === user.id) {
          toast({ title: "Action Prohibited", description: "Cannot delete your own admin account.", variant: "destructive" });
          return;
        }
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast({ title: "User Deleted", description: "User has been successfully deleted.", variant: "destructive" });
      };


      const value = {
        tasks, createTask, updateTask, deleteTask,
        reminders, createReminder, updateReminder, deleteReminder,
        notes, createNote, updateNote, deleteNote,
        users, createUser, updateUser, deleteUser,
        getUserById: (id) => users.find(u => u.id === id),
      };

      return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
    };

    export const useData = () => {
      const context = useContext(DataContext);
      if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
      }
      return context;
    };
  