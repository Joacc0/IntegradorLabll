import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL);
    
    socket.on('friendRequest', (data) => {
      setNotifications(prev => [...prev, {
        type: 'friendRequest',
        from: data.from,
        date: new Date()
      }]);
    });
    
    return () => socket.disconnect();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};