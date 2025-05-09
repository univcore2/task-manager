
    import React, { useState, useMemo } from 'react';
    import { useData } from '@/contexts/DataContext';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
    import { PlusCircle, ListChecks, Search } from 'lucide-react';
    import TaskForm from '@/components/tasks/TaskForm';
    import TaskColumn from '@/components/tasks/TaskColumn';
    import TaskFilters from '@/components/tasks/TaskFilters';

    const TasksPageHeader = ({ onOpenForm }) => (
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <Button onClick={onOpenForm}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>
    );

    const NoTasksView = ({ onOpenForm, isFiltered }) => (
      <div className="text-center py-10">
        {isFiltered ? (
          <>
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-xl font-semibold">No tasks found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </>
        ) : (
          <>
            <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-xl font-semibold">No tasks yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new task.
            </p>
            <Button className="mt-4" onClick={onOpenForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </>
        )}
      </div>
    );

    const TaskBoard = ({ tasksByStatus, onEdit, onDelete, onStatusChange, users, filterStatus }) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(filterStatus === 'all' || filterStatus === 'todo') && (
          <TaskColumn status="todo" tasks={tasksByStatus.todo} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} users={users} />
        )}
        {(filterStatus === 'all' || filterStatus === 'inprogress') && (
          <TaskColumn status="inprogress" tasks={tasksByStatus.inprogress} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} users={users} />
        )}
        {(filterStatus === 'all' || filterStatus === 'done') && (
          <TaskColumn status="done" tasks={tasksByStatus.done} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} users={users} />
        )}
      </div>
    );
    
    const TasksPage = () => {
      const { tasks, createTask, updateTask, deleteTask, users } = useData();
      const { user } = useAuth();
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingTask, setEditingTask] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterStatus, setFilterStatus] = useState('all');
      const [filterPriority, setFilterPriority] = useState('all');

      const relevantTasks = useMemo(() => {
        return tasks
          .filter(task => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = task.title.toLowerCase().includes(term) || (task.description && task.description.toLowerCase().includes(term));
            const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
            const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
            
            const isAdmin = user.role === 'admin';
            const isAssignedToUser = task.assignee === user.id;
            const wasCreatedByUser = task.createdBy === user.id;
            
            if(isAdmin) return matchesSearch && matchesStatus && matchesPriority;
            return matchesSearch && matchesStatus && matchesPriority && (isAssignedToUser || wasCreatedByUser);
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }, [tasks, searchTerm, filterStatus, filterPriority, user]);

      const handleCreateTask = (taskData) => {
        createTask(taskData);
        setIsFormOpen(false);
      };

      const handleUpdateTask = (taskData) => {
        if (editingTask) {
          updateTask(editingTask.id, taskData);
        }
        setEditingTask(null);
        setIsFormOpen(false);
      };

      const handleEdit = (task) => {
        setEditingTask(task);
        setIsFormOpen(true);
      };

      const handleDelete = (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
          deleteTask(taskId);
        }
      };

      const handleStatusChange = (taskId, newStatus) => {
        updateTask(taskId, { status: newStatus });
      };
      
      const tasksByStatus = {
        todo: relevantTasks.filter(t => t.status === 'todo'),
        inprogress: relevantTasks.filter(t => t.status === 'inprogress'),
        done: relevantTasks.filter(t => t.status === 'done'),
      };

      const openForm = () => {
        setEditingTask(null);
        setIsFormOpen(true);
      };

      const closeForm = () => {
        setIsFormOpen(false);
        setEditingTask(null);
      };

      const isFiltered = searchTerm || filterStatus !== 'all' || filterPriority !== 'all';

      return (
        <div className="space-y-6">
          <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsFormOpen(open);}}>
            <TasksPageHeader onOpenForm={openForm} />
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
                </DialogDescription>
              </DialogHeader>
              <TaskForm 
                task={editingTask} 
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask} 
                users={users}
                onCancel={closeForm}
              />
            </DialogContent>
          </Dialog>

          <TaskFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
          />
          
          {relevantTasks.length === 0 ? (
             <NoTasksView onOpenForm={openForm} isFiltered={isFiltered} />
          ) : (
            <TaskBoard 
              tasksByStatus={tasksByStatus} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
              onStatusChange={handleStatusChange} 
              users={users}
              filterStatus={filterStatus}
            />
          )}
        </div>
      );
    };
    
    export default TasksPage;
  