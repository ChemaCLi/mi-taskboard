import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, LogIn, User, Lock, Zap, Shield } from 'lucide-react';
import { useAuth } from './AuthContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        login(result.token, result.user);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-32 left-40 w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
      <div className="absolute bottom-20 right-20 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md relative bg-gray-900/90 border-cyan-400/50 shadow-2xl backdrop-blur-sm">
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 rounded-lg blur-xl"></div>
        <div className="relative bg-gray-900/95 rounded-lg border border-cyan-400/30">
          
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="relative p-4 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 border border-cyan-400/40">
                <div className="absolute inset-0 bg-cyan-400/10 rounded-full animate-pulse"></div>
                <Shield className="w-8 h-8 text-cyan-400 relative z-10" />
                <Zap className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
            </div>
            <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ACCESS TERMINAL
            </CardTitle>
            <CardDescription className="text-center text-cyan-200/80 text-sm">
              Initialize neural link to Mission Control matrix
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-400/50 bg-red-900/20 backdrop-blur-sm">
                  <AlertDescription className="text-red-300 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-red-400" />
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="username" className="text-cyan-300 font-semibold tracking-wide">
                  USER.ID
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-cyan-400/70 group-focus-within:text-cyan-300 transition-colors" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter user identification"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-gray-800/50 border-cyan-400/30 text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-300 focus:ring-cyan-300/20 focus:ring-2 transition-all duration-300 font-mono"
                  />
                  <div className="absolute inset-0 border border-cyan-400/0 group-focus-within:border-cyan-400/30 rounded-md transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-cyan-300 font-semibold tracking-wide">
                  AUTH.CODE
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-cyan-400/70 group-focus-within:text-cyan-300 transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter authentication sequence"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-gray-800/50 border-cyan-400/30 text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-300 focus:ring-cyan-300/20 focus:ring-2 transition-all duration-300 font-mono"
                  />
                  <div className="absolute inset-0 border border-cyan-400/0 group-focus-within:border-cyan-400/30 rounded-md transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold py-3 tracking-wide transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/10 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    CONNECTING...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    JACK IN
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-center">
              <div className="text-cyan-400/60 text-sm mb-2">[ NEW USER DETECTED ]</div>
              <button
                onClick={onSwitchToRegister}
                className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold hover:from-cyan-300 hover:to-purple-300 transition-all duration-300 tracking-wide"
              >
                INITIALIZE NEW NEURAL PROFILE
              </button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
} 