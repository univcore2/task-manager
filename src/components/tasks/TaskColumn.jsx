
    import React from 'react';
    import TaskCard from '@/components/tasks/TaskCard';
    import { motion, AnimatePresence } from 'framer-motion';
    import { CheckCircle2, Radio, Clock } from 'lucide-react';

    const statusConfig = {
      todo: { title: 'To Do', icon: <Radio className="h-5 w-5 text-blue-500" />, color: 'border-blue-500'},
      inprogress: { title: 'In Progress', icon: <Clock className="h-5 w-5 text-yellow-500" />, color: 'border-yellow-500'},
      done: { title: 'Done', icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, color: 'border-green-500'},
    };

    const TaskColumn = ({ status, tasks, onEdit, onDelete, onStatusChange, users }) => {
      const config = statusConfig[status];
    
      return (
        <div className="space-y-4 bg-muted/30 p-4 rounded-lg min-h-[200px]">
          <div className={`flex items-center pb-2 border-b-2 ${config.color}`}>
            {config.icon}
            <h2 className="ml-2 text-lg font-semibold">{config.title} ({tasks.length})</h2>
          </div>
          <AnimatePresence>
            {tasks.length > 0 ? (
              tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                  onStatusChange={onStatusChange}
                  users={users}
                />
              ))
            ) : (
               <motion.div 
                layout 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="text-center py-6 text-sm text-muted-foreground"
               >
                No tasks in this category.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    };

    export default TaskColumn;
  