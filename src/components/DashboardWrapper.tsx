import React from 'react';
import { AuthProvider } from './AuthContext';
import { MissionDataHydration } from './MissionDataHydration';
import { ModalsProvider } from './ModalsContext';
import { ModalsWrapper } from './ModalsWrapper';
import App from './App';

export function DashboardWrapper() {
  return (
    <AuthProvider>
      <MissionDataHydration>
        <ModalsProvider>
          <App />
          <ModalsWrapper />
        </ModalsProvider>
      </MissionDataHydration>
    </AuthProvider>
  );
} 