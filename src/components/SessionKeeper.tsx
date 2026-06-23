'use client';

import React, { useEffect } from 'react';

const SessionKeeper: React.FC = () => {
  useEffect(() => {
    let lastPing = Date.now();
    const PING_INTERVAL = 5 * 60 * 1000; // Ping every 5 minutes if active

    const keepAlive = async () => {
      const now = Date.now();
      if (now - lastPing > PING_INTERVAL) {
        lastPing = now;
        try {
          // Simply touch the session endpoint to extend active sessions. No reload on guests.
          await fetch('/api/auth/session');
        } catch (err) {
          console.error('Session keep-alive failed:', err);
        }
      }
    };

    const handleActivity = () => {
      keepAlive();
    };

    // Listen to standard user interaction events to refresh active session
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  return null;
};

export default SessionKeeper;

