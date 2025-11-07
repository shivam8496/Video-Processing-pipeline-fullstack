// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './authContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth(); // Get user from AuthContext

  useEffect(() => {
    if (user && user.token) {
      // Connect to the socket server, passing the token
      const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: {
          token: user.token,
        },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      newSocket.on('connect_error', (err) => {
        console.log('Socket connection error:', err.message);
        console.error('Socket connection error:', err.message);
      });

      setSocket(newSocket);

      // Disconnect when component unmounts or user logs out
      return () => {
        newSocket.disconnect();
      };
    } else {
      // If no user, disconnect any existing socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]); // Re-run effect if the user changes

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};