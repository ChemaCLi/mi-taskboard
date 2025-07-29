import React from 'react';
import { AuthProvider } from './AuthContext';
import { MissionDataHydration } from './MissionDataHydration';
import App from './App';

export function DashboardWrapper() {
  return (
    <AuthProvider>
      <MissionDataHydration>
        <App />
      </MissionDataHydration>
    </AuthProvider>
  );
} 