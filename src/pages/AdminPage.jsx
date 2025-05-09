
    import React, { useState, useMemo } from 'react';
    import { useData } from '@/contexts/DataContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { PlusCircle, Edit2, Trash2, Users, Search, Filter, ShieldCheck, UserCog } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { toast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';

    const UserForm = ({ user, onSubmit, onCancel }) => {
      const [name, setName] = useState(user?.name || '');
      const [email, setEmail] = useState(user?.email || '');
      const [role, setRole] = useState(user?.role || 'user');
      const [password, setPassword] = useState('');

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email || ( !user && !password ) ) {
            toast({ title: "Validation Error", description: "Name, email, and password (for new users) are required.", variant: "destructive"});
            return;
        }
        onSubmit({ name, email, role, password: password || undefined });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          {!user && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
            </div>
          )}
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{user ? 'Update User' : 'Create User'}</Button>
          </DialogFooter>
        </form>
      );
    };

    const AdminPage = () => {
      const { users, createUser, updateUser, deleteUser } = useData();
      const { user: currentUser } = useAuth();
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingUser, setEditingUser] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterRole, setFilterRole] = useState('all');

      const filteredUsers = useMemo(() => {
        return users
          .filter(u => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
            const matchesRole = filterRole === 'all' || u.role === filterRole;
            return matchesSearch && matchesRole;
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }, [users, searchTerm, filterRole]);

      const handleCreateUser = (userData) => {
        createUser(userData);
        setIsFormOpen(false);
      };

      const handleUpdateUser = (userData) => {
        if (editingUser) {
          updateUser(editingUser.id, userData);
        }
        setEditingUser(null);
        setIsFormOpen(false);
      };

      const handleEdit = (userToEdit) => {
        setEditingUser(userToEdit);
        setIsFormOpen(true);
      };

      const handleDelete = (userId) => {
        if (userId === currentUser.id) {
          toast({ title: "Action Prohibited", description: "You cannot delete your own account.", variant: "destructive" });
          return;
        }
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            deleteUser(userId);
        }
      };
      
      const getRoleIcon = (role) => {
        return role === 'admin' ? <ShieldCheck className="h-5 w-5 text-primary" /> : <UserCog className="h-5 w-5 text-muted-foreground" />;
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight flex items-center"><Users className="mr-3 h-8 w-8" /> User Management</h1>
            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingUser(null); }}>
              <DialogTrigger asChild>
                <Button onClick={() => {setEditingUser(null); setIsFormOpen(true);}}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Update user details.' : 'Fill in the details for the new user.'}
                  </DialogDescription>
                </DialogHeader>
                <UserForm 
                  user={editingUser} 
                  onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                  onCancel={() => { setIsFormOpen(false); setEditingUser(null);}}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>User List</CardTitle>
              <CardDescription>Manage all users in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                    />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full md:w-auto">
                    <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-xl font-semibold">No users found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm || filterRole !== 'all' ? "Try adjusting your search or filter." : "Create the first user!"}
                  </p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                    {filteredUsers.map((userItem) => (
                      <motion.tr 
                        key={userItem.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={`https://avatar.vercel.sh/${userItem.email}.png`} alt={userItem.name} />
                              <AvatarFallback>{userItem.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{userItem.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(userItem.role)}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${userItem.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                              {userItem.role}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(userItem.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(userItem)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(userItem.id)} disabled={userItem.id === currentUser.id}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    };

    export default AdminPage;
  