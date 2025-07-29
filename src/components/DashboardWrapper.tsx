import React from 'react';
import { AuthProvider } from './AuthContext';
import App from './App';

export function DashboardWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
} 