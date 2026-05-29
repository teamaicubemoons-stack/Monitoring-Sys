import React, { useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
// Removed socket.io import

const ActivityTracker = () => {
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const statusRef = useRef('online');

  useEffect(() => {
    if (!user) return;

    // Use dynamic protocol and host for production WebSocket
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL || 
      (window.location.hostname === 'localhost' 
        ? `ws://localhost:8000/ws/${user.id}` 
        : `${wsProtocol}//${window.location.host}/api/ws/${user.id}`);

    const ws = new WebSocket(wsUrl);
    
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      if (statusRef.current !== 'online' && statusRef.current !== 'active') {
        statusRef.current = 'active';
        ws.send(JSON.stringify({ status: 'active' }));
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => document.addEventListener(event, updateActivity));

    const visibilityChange = () => {
      if (document.hidden) {
        statusRef.current = 'away';
        ws.send(JSON.stringify({ status: 'away' }));
      } else {
        updateActivity();
      }
    };
    document.addEventListener('visibilitychange', visibilityChange);

    const interval = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime > 300000 && statusRef.current !== 'idle' && !document.hidden) { // 5 minutes
        statusRef.current = 'idle';
        ws.send(JSON.stringify({ status: 'idle' }));
      }
    }, 10000);

    return () => {
      events.forEach(event => document.removeEventListener(event, updateActivity));
      document.removeEventListener('visibilitychange', visibilityChange);
      clearInterval(interval);
      ws.close();
    };
  }, [user]);

  return null; // Invisible component
};

export default ActivityTracker;
