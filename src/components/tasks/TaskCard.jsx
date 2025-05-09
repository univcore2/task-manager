
    import React from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Edit2, Trash2, CalendarDays, CheckCircle2, Radio, Clock, Paperclip } from 'lucide-react';
    import { motion } from 'framer-motion';

    const TaskCard = ({ task, onEdit, onDelete, onStatusChange, users }) => {
      const assigneeUser = users.find(u => u.id === task.assignee);
      const { user: currentUser } = useAuth();

      const getPriorityColor = (priority) => {
        if (priority === 'high') return 'border-red-500';
        if (priority === 'medium') return 'border-yellow-500';
        return 'border-green-500';
      };

      const getStatusIcon = (status) => {
        if (status === 'todo') return <Radio className="h-5 w-5 text-blue-500" />;
        if (status === 'inprogress') return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      };
      
      const canManageTask = currentUser.role === 'admin' || currentUser.id === task.createdBy;

      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${getPriorityColor(task.priority)} flex flex-col h-full`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                {canManageTask && (
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(task)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                )}
              </div>
              <CardDescription className="text-sm pt-1 h-10 overflow-hidden text-ellipsis">
                {task.description?.substring(0, 100)}{task.description?.length > 100 && '...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow">
              <div className="flex items-center text-sm text-muted-foreground">
                {getStatusIcon(task.status)}
                <Select value={task.status} onValueChange={(newStatus) => onStatusChange(task.id, newStatus)} disabled={!canManageTask && task.assignee !== currentUser.id}>
                  <SelectTrigger className="ml-2 h-8 text-xs w-[120px]" >
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="inprogress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {task.dueDate && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-2 h-4 w-4" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
              {assigneeUser && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={`https://avatar.vercel.sh/${assigneeUser.email}.png`} alt={assigneeUser.name} />
                    <AvatarFallback>{assigneeUser.name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  Assigned to: {assigneeUser.name}
                </div>
              )}
              {task.attachments && task.attachments.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Paperclip className="mr-2 h-4 w-4" />
                    <span>{task.attachments.length} attachment(s)</span>
                  </div>
                  <ul className="list-disc list-inside pl-4 text-xs">
                    {task.attachments.slice(0,2).map((att, idx) => <li key={idx} className="truncate">{att.name}</li>)}
                    {task.attachments.length > 2 && <li className="text-xs">...and {task.attachments.length - 2} more</li>}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground border-t pt-3">
                Created: {new Date(task.createdAt).toLocaleDateString()} by {users.find(u => u.id === task.createdBy)?.name || 'Unknown'}
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default TaskCard;
  