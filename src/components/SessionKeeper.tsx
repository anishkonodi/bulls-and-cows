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
          const res = await fetch('/api/auth/session');
          if (res.ok) {
            const data = await res.json();
            // NextAuth returns empty object {} when no session is active or expired
            if (!data || Object.keys(data).length === 0) {
              window.location.reload();
            }
          }
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

    // Periodic check to auto-logout inactive sessions even without user interaction
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (!data || Object.keys(data).length === 0) {
            window.location.reload();
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    };

    const interval = setInterval(checkSession, 60 * 1000); // Check every minute

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default SessionKeeper;
