import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, UserPlus, User, Lock, Mail, Zap, Shield, Brain, Cpu } from 'lucide-react';
import { useAuth } from './AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Authentication codes do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Authentication sequence must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        login(result.token, result.user);
      } else {
        setError(result.error || 'Neural profile initialization failed');
      }
    } catch (err) {
      setError('System error detected. Neural link unstable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-pink-900/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 0, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-16 left-16 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
      <div className="absolute top-32 right-24 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-40 left-32 w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
      <div className="absolute bottom-16 right-16 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-8 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>

      {/* Main Register Card */}
      <Card className="w-full max-w-md relative bg-gray-900/90 border-purple-400/50 shadow-2xl backdrop-blur-sm">
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-cyan-400/20 to-pink-400/20 rounded-lg blur-xl"></div>
        <div className="relative bg-gray-900/95 rounded-lg border border-purple-400/30">
          
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="relative p-4 rounded-full bg-gradient-to-r from-purple-400/20 to-cyan-400/20 border border-purple-400/40">
                <div className="absolute inset-0 bg-purple-400/10 rounded-full animate-pulse"></div>
                <Brain className="w-8 h-8 text-purple-400 relative z-10" />
                <Cpu className="w-4 h-4 text-cyan-400 absolute -top-1 -right-1 animate-spin" />
                <Zap className="w-3 h-3 text-yellow-400 absolute -bottom-1 -left-1 animate-bounce" />
              </div>
            </div>
            <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              NEURAL GENESIS
            </CardTitle>
            <CardDescription className="text-center text-purple-200/80 text-sm">
              Establishing new consciousness matrix profile
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert className="border-red-400/50 bg-red-900/20 backdrop-blur-sm">
                  <AlertDescription className="text-red-300 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-red-400" />
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="username" className="text-purple-300 font-semibold tracking-wide">
                  NEURAL.ID
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-purple-400/70 group-focus-within:text-purple-300 transition-colors" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Define neural identification"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-gray-800/50 border-purple-400/30 text-purple-100 placeholder-purple-400/50 focus:border-purple-300 focus:ring-purple-300/20 focus:ring-2 transition-all duration-300 font-mono"
                  />
                  <div className="absolute inset-0 border border-purple-400/0 group-focus-within:border-purple-400/30 rounded-md transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-purple-300 font-semibold tracking-wide">
                  COMM.LINK
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-purple-400/70 group-focus-within:text-purple-300 transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Establish communication channel"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-gray-800/50 border-purple-400/30 text-purple-100 placeholder-purple-400/50 focus:border-purple-300 focus:ring-purple-300/20 focus:ring-2 transition-all duration-300 font-mono"
                  />
                  <div className="absolute inset-0 border border-purple-400/0 group-focus-within:border-purple-400/30 rounded-md transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-purple-300 font-semibold tracking-wide">
                  CIPHER.KEY
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-purple-400/70 group-focus-within:text-purple-300 transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Generate encryption sequence"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-gray-800/50 border-purple-400/30 text-purple-100 placeholder-purple-400/50 focus:border-purple-300 focus:ring-purple-300/20 focus:ring-2 transition-all duration-300 font-mono"
                  />
                  <div className="absolute inset-0 border border-purple-400/0 group-focus-within:border-purple-400/30 rounded-md transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-purple-300 font-semibold tracking-wide">
                  VERIFY.CIPHER
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-purple-400/70 group-focus-within:text-purple-300 transition-colors" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm encryption sequence"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-gray-800/50 border-purple-400/30 text-purple-100 placeholder-purple-400/50 focus:border-purple-300 focus:ring-purple-300/20 focus:ring-2 transition-all duration-300 font-mono"
                  />
                  <div className="absolute inset-0 border border-purple-400/0 group-focus-within:border-purple-400/30 rounded-md transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 via-cyan-600 to-pink-600 hover:from-purple-500 hover:via-cyan-500 hover:to-pink-500 text-white font-bold py-3 tracking-wide transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/10 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    INITIALIZING...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    ACTIVATE NEURAL LINK
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-center">
              <div className="text-purple-400/60 text-sm mb-2">[ EXISTING USER DETECTED ]</div>
              <button
                onClick={onSwitchToLogin}
                className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text font-semibold hover:from-purple-300 hover:to-cyan-300 transition-all duration-300 tracking-wide"
              >
                ACCESS EXISTING NEURAL PROFILE
              </button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
} 