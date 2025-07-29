import React from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, User, Shield } from 'lucide-react';

export function AuthGuard() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 border border-cyan-400/30 rounded-lg backdrop-blur">
        <Shield className="w-4 h-4 text-green-400" />
        <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
          <User className="w-3 h-3 mr-1" />
          {user.username}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1 h-auto"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 