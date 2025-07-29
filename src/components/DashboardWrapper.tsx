import React from 'react';
import { AuthProvider } from './AuthContext';
import { AuthGuard } from './AuthGuard';
import App from './App';

export function DashboardWrapper() {
  return (
    <AuthProvider>
      <div>
        <AuthGuard />
        <App />
      </div>
    </AuthProvider>
  );
} 