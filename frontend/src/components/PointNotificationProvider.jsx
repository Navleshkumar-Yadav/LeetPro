import { createContext, useContext, useEffect, useState } from 'react';
import socket from '../utils/socket';

const PointNotificationContext = createContext();

export const PointNotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    socket.on('point_rewarded', ({ mission, points }) => {
      setNotification({ mission, points });
      setTimeout(() => setNotification(null), 4000);
    });
    return () => {
      socket.off('point_rewarded');
    };
  }, []);

  // Optionally allow manual triggering
  const showNotification = (mission, points) => {
    setNotification({ mission, points });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <PointNotificationContext.Provider value={{ showNotification }}>
      {/* Notification UI */}
      {notification && (
        <div className="fixed top-6 right-6 z-50">
          <div className="animate-slide-in-up bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 shadow-lg rounded-xl px-6 py-4 flex items-center space-x-4 border-2 border-yellow-500">
            <span className="text-3xl">🎉</span>
            <div>
              <div className="text-lg font-bold text-gray-900">+{notification.points} Points!</div>
              <div className="text-sm text-gray-800">{notification.mission}</div>
            </div>
          </div>
        </div>
      )}
      {children}
    </PointNotificationContext.Provider>
  );
};

export const usePointNotification = () => useContext(PointNotificationContext); 