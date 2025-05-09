
    import React, { useState, useMemo } from 'react';
    import { useData } from '@/contexts/DataContext';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { PlusCircle, Edit2, Trash2, BellRing, CalendarClock } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { toast } from '@/components/ui/use-toast';

    const ReminderForm = ({ reminder, onSubmit, onCancel }) => {
      const [title, setTitle] = useState(reminder?.title || '');
      const [reminderTime, setReminderTime] = useState(reminder?.reminderTime ? new Date(reminder.reminderTime).toISOString().substring(0, 16) : '');

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !reminderTime) {
          toast({ title: "Validation Error", description: "Title and reminder time are required.", variant: "destructive"});
          return;
        }
        onSubmit({ title, reminderTime });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Team meeting" />
          </div>
          <div>
            <Label htmlFor="reminderTime">Reminder Time</Label>
            <Input id="reminderTime" type="datetime-local" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{reminder ? 'Update Reminder' : 'Set Reminder'}</Button>
          </DialogFooter>
        </form>
      );
    };

    const ReminderCard = ({ reminder, onEdit, onDelete }) => {
      const isPast = new Date(reminder.reminderTime) < new Date();
      return (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`shadow-md hover:shadow-lg transition-shadow duration-300 ${isPast ? 'opacity-60 bg-muted/50' : 'bg-card'}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className={`text-lg ${isPast ? 'line-through' : ''}`}>{reminder.title}</CardTitle>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(reminder)}><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(reminder.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarClock className="mr-2 h-4 w-4" />
                {new Date(reminder.reminderTime).toLocaleString()}
              </div>
              {isPast && <p className="text-xs text-red-500 mt-1">This reminder is in the past.</p>}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    const RemindersPage = () => {
      const { reminders, createReminder, updateReminder, deleteReminder } = useData();
      const { user } = useAuth();
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingReminder, setEditingReminder] = useState(null);

      const userReminders = useMemo(() => {
        return reminders
          .filter(r => r.userId === user.id)
          .sort((a, b) => new Date(a.reminderTime) - new Date(b.reminderTime));
      }, [reminders, user.id]);

      const handleCreateReminder = (reminderData) => {
        createReminder(reminderData);
        setIsFormOpen(false);
      };

      const handleUpdateReminder = (reminderData) => {
        if (editingReminder) {
          updateReminder(editingReminder.id, reminderData);
        }
        setEditingReminder(null);
        setIsFormOpen(false);
      };

      const handleEdit = (reminder) => {
        setEditingReminder(reminder);
        setIsFormOpen(true);
      };

      const handleDelete = (reminderId) => {
         if (window.confirm("Are you sure you want to delete this reminder?")) {
            deleteReminder(reminderId);
         }
      };
      
      const upcomingReminders = userReminders.filter(r => new Date(r.reminderTime) >= new Date());
      const pastReminders = userReminders.filter(r => new Date(r.reminderTime) < new Date());


      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">My Reminders</h1>
            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingReminder(null); }}>
              <DialogTrigger asChild>
                <Button onClick={() => {setEditingReminder(null); setIsFormOpen(true);}}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Set New Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Set New Reminder'}</DialogTitle>
                  <DialogDescription>
                    {editingReminder ? 'Update the details of your reminder.' : 'Fill in the details for your new reminder.'}
                  </DialogDescription>
                </DialogHeader>
                <ReminderForm 
                  reminder={editingReminder} 
                  onSubmit={editingReminder ? handleUpdateReminder : handleCreateReminder}
                  onCancel={() => { setIsFormOpen(false); setEditingReminder(null);}}
                />
              </DialogContent>
            </Dialog>
          </div>

          {userReminders.length === 0 ? (
            <div className="text-center py-10">
              <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-xl font-semibold">No reminders set</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Click "Set New Reminder" to add your first one.
              </p>
            </div>
          ) : (
            <>
              {upcomingReminders.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Upcoming Reminders</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {upcomingReminders.map(reminder => (
                        <ReminderCard key={reminder.id} reminder={reminder} onEdit={handleEdit} onDelete={handleDelete} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {pastReminders.length > 0 && (
                 <div>
                  <h2 className="text-xl font-semibold mb-3 mt-8">Past Reminders</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {pastReminders.map(reminder => (
                        <ReminderCard key={reminder.id} reminder={reminder} onEdit={handleEdit} onDelete={handleDelete} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    };

    export default RemindersPage;
  