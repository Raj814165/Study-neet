import React, { createContext, useContext } from 'react';

const NotificationContext = createContext({});

export const useNotifications = () => useContext(NotificationContext);

// Push notifications are completely disabled.
// Only the announcement broadcast system (admin dashboard -> /notifications/broadcast) is active.
export const NotificationProvider = ({ children }) => {
  return (
    <NotificationContext.Provider value={{ expoPushToken: null }}>
      {children}
    </NotificationContext.Provider>
  );
};
