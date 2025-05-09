
    import React from 'react';
    import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import SharedLayout from '@/components/SharedLayout';
    import DashboardPage from '@/pages/DashboardPage';
    import TasksPage from '@/pages/TasksPage';
    import RemindersPage from '@/pages/RemindersPage';
    import NotesPage from '@/pages/NotesPage';
    import AdminPage from '@/pages/AdminPage';
    import LoginPage from '@/pages/LoginPage'; 
    import { AuthProvider, useAuth } from '@/contexts/AuthContext';
    import { DataProvider } from '@/contexts/DataContext';

    function ProtectedRoute({ children, adminOnly = false }) {
      const { user, loading } = useAuth();

      if (loading) {
        return (
          <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary to-secondary">
            <div className="text-4xl font-bold text-primary-foreground animate-pulse">Loading...</div>
          </div>
        );
      }

      if (!user) {
        return <Navigate to="/login" replace />;
      }

      if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
      }

      return children;
    }

    function AppRoutes() {
      return (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <SharedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route 
              path="admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    }
    
    function App() {
      return (
        <AuthProvider>
          <DataProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster />
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      );
    }

    export default App;
  