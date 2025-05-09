
    import React, { createContext, useContext, useState, useEffect } from 'react';
    import { useLocalStorage } from '@/hooks/useLocalStorage'; 

    const AuthContext = createContext(null);

    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useLocalStorage('authUser', null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setLoading(false);
      }, []);


      const login = async (email, password, role = 'user') => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        let userData;
        if (email === 'admin@example.com' && password === 'adminpass') {
          userData = { id: 'admin001', name: 'Admin User', email: 'admin@example.com', role: 'admin' };
        } else if (email === 'user@example.com' && password === 'userpass') {
          userData = { id: 'user001', name: 'Regular User', email: 'user@example.com', role: 'user' };
        } else {
          setLoading(false);
          throw new Error('Invalid credentials');
        }
        
        setUser(userData);
        setLoading(false);
        return userData;
      };

      const logout = () => {
        setUser(null);
      };

      const value = {
        user,
        loading,
        login,
        logout,
      };

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };
  