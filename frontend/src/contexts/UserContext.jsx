import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, getUserById } from '@/utils/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user exists in localStorage
    const storedUserId = localStorage.getItem('keyboard_user_id');
    const storedUsername = localStorage.getItem('keyboard_username');
    
    if (storedUserId && storedUsername) {
      setUser({
        id: storedUserId,
        username: storedUsername
      });
    }
    setLoading(false);
  }, []);

  const login = async (username) => {
    const result = await registerUser(username);
    if (result.success) {
      const userData = {
        id: result.data.id,
        username: result.data.username
      };
      setUser(userData);
      localStorage.setItem('keyboard_user_id', userData.id);
      localStorage.setItem('keyboard_username', userData.username);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('keyboard_user_id');
    localStorage.removeItem('keyboard_username');
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
