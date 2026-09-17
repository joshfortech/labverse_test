import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FlaskConical, Microscope, HelpCircle, User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useLabStore } from '../../stores/labStore';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { theme, setTheme, soundEnabled, setSoundEnabled, sidebarOpen, setSidebarOpen } = useLabStore();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FlaskConical },
    { path: '/physics', label: 'Physics', icon: FlaskConical },
    { path: '/chemistry', label: 'Chemistry', icon: FlaskConical },
    { path: '/biology', label: 'Biology', icon: Microscope },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="mx-auto flex max-w-[1400px] h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="Labverse Home">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lab-green">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold text-xl text-slate-900 sm:block">Labverse</span>
          </Link>
        </div>

        <nav className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-lab-green-light text-lab-green'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Enable dark mode' : 'Enable light mode'}
          >
            {theme === 'light' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            {soundEnabled ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1m8.943 12.214a9.962 9.962 0 01-4.516-1.237l-2.143 2.143A12.06 12.06 0 0015.536 18.464a12.06 12.06 0 006.273-2.25l2.143 2.143A12.06 12.06 0 0114.52 21c-3.314 0-6.332-.92-8.935-2.523" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-xl">
                  <div className="h-9 w-9 rounded-xl bg-lab-green-light flex items-center justify-center">
                    <User className="h-5 w-5 text-lab-green" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                    <p className="text-xs text-slate-500">{user.school_name || 'No school specified'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full" onClick={() => setSidebarOpen(false)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/progress" className="w-full" onClick={() => setSidebarOpen(false)}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Progress
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};