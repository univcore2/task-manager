
    import React, { useState } from 'react';
    import { Outlet, Link, useLocation } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { useAuth } from '@/contexts/AuthContext';
    import {
      LayoutDashboard,
      ListChecks,
      BellRing,
      StickyNote,
      Users,
      LogOut,
      Settings,
      Menu,
      X,
      Moon,
      Sun,
    } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from '@/components/ui/dropdown-menu';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

    const navItems = [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Tasks', icon: ListChecks, path: '/tasks' },
      { name: 'Reminders', icon: BellRing, path: '/reminders' },
      { name: 'Notes', icon: StickyNote, path: '/notes' },
    ];

    const adminNavItems = [
      { name: 'User Management', icon: Users, path: '/admin' },
    ];

    const NavLink = ({ item, collapsed }) => {
      const location = useLocation();
      const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
      return (
        <Link to={item.path}>
          <motion.div
            whileHover={{ scale: 1.05, x: collapsed ? 0 : 5 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ease-in-out
              ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-primary/10 hover:text-primary/90'}
              ${collapsed ? 'justify-center' : ''}`}
          >
            <item.icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && <span className="font-medium">{item.name}</span>}
          </motion.div>
        </Link>
      );
    };
    
    const Sidebar = ({ collapsed, setCollapsed }) => {
      const { user } = useAuth();
      const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/78f2817e-7b4a-4cfc-b926-b6c595976b7a/25674fd3dadb095ddfb23eafa0adacf6.png";

      return (
        <motion.div
          initial={false}
          animate={{ width: collapsed ? '5rem' : '16rem' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-card text-card-foreground border-r border-border flex flex-col h-full shadow-lg"
        >
          <div className={`flex items-center p-4 border-b border-border ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <img src={logoUrl} alt="Marundeshwara Enterprises Logo" className="h-10 object-contain" />
            )}
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground">
              {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          </div>
          <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
            {navItems.map(item => <NavLink key={item.name} item={item} collapsed={collapsed} />)}
            {user?.role === 'admin' && (
              <>
                <div className={`px-3 py-2 text-xs font-semibold uppercase text-muted-foreground ${collapsed ? 'text-center' : ''}`}>
                  {collapsed ? 'Adm' : 'Admin'}
                </div>
                {adminNavItems.map(item => <NavLink key={item.name} item={item} collapsed={collapsed} />)}
              </>
            )}
          </nav>
          {!collapsed && (
             <div className="p-4 border-t border-border text-center text-xs text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Marundeshwara Ent.</p>
              <p>All rights reserved.</p>
            </div>
          )}
        </motion.div>
      );
    };
    
    const Header = ({ collapsed }) => {
      const { user, logout } = useAuth();
      const [darkMode, setDarkMode] = React.useState(() => {
        const storedTheme = localStorage.getItem('theme');
        return storedTheme ? storedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      });
    
      React.useEffect(() => {
        if (darkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      }, [darkMode]);
    
      const toggleDarkMode = () => setDarkMode(prev => !prev);

      const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) {
          return parts[0][0] + parts[parts.length - 1][0];
        }
        return parts[0][0];
      };

      return (
        <header className="bg-card text-card-foreground border-b border-border p-4 flex items-center justify-end sticky top-0 z-40 shadow-sm">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle theme">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatarUrl || `https://avatar.vercel.sh/${user?.email || 'user'}.png`} alt={user?.name || 'User'} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'user@example.com'} ({user?.role})
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      );
    };

    const SharedLayout = () => {
      const [collapsed, setCollapsed] = useState(false);
    
      return (
        <div className="flex h-screen bg-background overflow-hidden">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header collapsed={collapsed} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-muted/40">
              <AnimatePresence mode="wait">
                <motion.div
                  key={useLocation().pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      );
    };

    export default SharedLayout;
  