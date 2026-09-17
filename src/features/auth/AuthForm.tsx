import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical, Mail, Lock, User, AlertCircle, Eye, EyeOff, Github } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { useAuthStore } from '../../stores/authStore';
import { signUp, signIn, supabase } from '../../lib/supabase';

import { useToast } from '../../components/common/Toast';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { initializeAuth } = useAuthStore();
  const { show } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setError('Full name is required');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await signUp(email, password, fullName, schoolName);
        if (signUpError) throw signUpError;
        
        show({
          type: 'success',
          title: 'Account created!',
          message: 'Please check your email to verify your account.',
        });
        
        if (data.user) {
          navigate('/dashboard');
        }
      } else {
        const { data, error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;

        show({
          type: 'success',
          title: 'Welcome back!',
          message: 'You have been signed in successfully.',
        });

        if (data.user) {
          navigate('/dashboard');
        }
      }
      
      await initializeAuth();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'OAuth login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lab-green">
                <FlaskConical className="h-7 w-7 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-slate-600">
              {mode === 'login' 
                ? 'Sign in to continue your WAEC practical journey'
                : 'Join thousands of students mastering practical exams'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name (Optional)</Label>
                <Input
                  id="schoolName"
                  type="text"
                  placeholder="Springfield High School"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  autoComplete="organization"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <Separator className="my-6">Or continue with</Separator>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => handleOAuthLogin('google')} disabled={loading}>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </Button>
            <Button variant="outline" onClick={() => handleOAuthLogin('github')} disabled={loading}>
              <Github className="h-5 w-5 mr-2" />
              GitHub
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              to={mode === 'login' ? '/register' : '/login'}
              className="text-lab-green font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};