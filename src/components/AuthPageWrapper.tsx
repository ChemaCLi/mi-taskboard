import React from 'react';
import { AuthProvider } from './AuthContext';
import { AuthPage } from './AuthPage';

export function AuthPageWrapper() {
  return (
    <AuthProvider>
      <AuthPage />
    </AuthProvider>
  );
} 