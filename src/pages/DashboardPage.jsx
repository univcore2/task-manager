
    import React from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useData } from '@/contexts/DataContext';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { ListChecks, BellRing, StickyNote, Users, BarChart3 } from 'lucide-react';

    const StatCard = ({ title, value, icon, color, description }) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {React.cloneElement(icon, { className: `h-5 w-5 ${color}` })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </CardContent>
        </Card>
      </motion.div>
    );
    
    const DashboardPage = () => {
      const { user } = useAuth();
      const { tasks, reminders, notes, users: allUsers } = useData();

      const userTasks = tasks.filter(task => task.assignee === user.id || task.createdBy === user.id);
      const userReminders = reminders.filter(reminder => reminder.userId === user.id);
      const userNotes = notes.filter(note => note.userId === user.id);

      const taskStats = {
        total: userTasks.length,
        todo: userTasks.filter(t => t.status === 'todo').length,
        inProgress: userTasks.filter(t => t.status === 'inprogress').length,
        done: userTasks.filter(t => t.status === 'done').length,
      };
      
      const upcomingReminders = userReminders
        .filter(r => new Date(r.reminderTime) > new Date())
        .sort((a, b) => new Date(a.reminderTime) - new Date(b.reminderTime))
        .slice(0, 3);

      const recentNotes = userNotes
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 3);

      return (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-lg text-muted-foreground">Here's an overview of your workspace.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Tasks" value={taskStats.todo + taskStats.inProgress} icon={<ListChecks />} color="text-blue-500" description={`${taskStats.done} completed`} />
            <StatCard title="Upcoming Reminders" value={userReminders.length} icon={<BellRing />} color="text-yellow-500" description={`${upcomingReminders.length} due soon`} />
            <StatCard title="My Notes" value={userNotes.length} icon={<StickyNote />} color="text-green-500" description={`${recentNotes.length} recently updated`} />
            {user?.role === 'admin' && (
              <StatCard title="Total Users" value={allUsers.length} icon={<Users />} color="text-purple-500" description="System-wide user count" />
            )}
          </div>
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary" /> Task Summary</CardTitle>
                <CardDescription>Quick look at your task distribution.</CardDescription>
              </CardHeader>
              <CardContent>
                {userTasks.length > 0 ? (
                  <div className="space-y-2">
                    <p>To Do: <span className="font-semibold">{taskStats.todo}</span></p>
                    <p>In Progress: <span className="font-semibold">{taskStats.inProgress}</span></p>
                    <p>Done: <span className="font-semibold">{taskStats.done}</span></p>
                    <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-green-500 h-2.5 rounded-l-full" 
                        style={{ width: `${(taskStats.done / taskStats.total) * 100}%`, display: 'inline-block' }}
                      ></div>
                      <div 
                        className="bg-yellow-500 h-2.5" 
                        style={{ width: `${(taskStats.inProgress / taskStats.total) * 100}%`, display: 'inline-block' }}
                      ></div>
                       <div 
                        className="bg-blue-500 h-2.5 rounded-r-full" 
                        style={{ width: `${(taskStats.todo / taskStats.total) * 100}%`, display: 'inline-block' }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No tasks assigned or created yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><BellRing className="mr-2 h-5 w-5 text-yellow-500" /> Upcoming Reminders</CardTitle>
                <CardDescription>Your next few reminders.</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingReminders.length > 0 ? (
                  <ul className="space-y-2">
                    {upcomingReminders.map(reminder => (
                      <li key={reminder.id} className="text-sm p-2 bg-muted/50 rounded-md">
                        <span className="font-semibold">{reminder.title}</span> - {new Date(reminder.reminderTime).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No upcoming reminders.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><StickyNote className="mr-2 h-5 w-5 text-green-500" /> Recent Notes</CardTitle>
              <CardDescription>Your latest notes at a glance.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentNotes.length > 0 ? (
                <ul className="space-y-3">
                  {recentNotes.map(note => (
                    <li key={note.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h4 className="font-semibold text-md">{note.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{note.content.substring(0,100)}...</p>
                      <p className="text-xs text-muted-foreground mt-1">Last updated: {new Date(note.updatedAt).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No notes created yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    };

    export default DashboardPage;
  