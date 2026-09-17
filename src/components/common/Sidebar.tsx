import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FlaskConical, Microscope, HelpCircle, BookOpen, Award, ChevronRight } from 'lucide-react';
import { useLabStore } from '../../stores/labStore';
import { cn } from '../../lib/utils';

const subjectItems = [
  { id: 'physics', label: 'Physics', icon: FlaskConical, color: 'text-blue-600 bg-blue-100', path: '/physics', description: 'Mechanics, Waves, Optics' },
  { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, color: 'text-orange-600 bg-orange-100', path: '/chemistry', description: 'Titration, Qualitative Analysis' },
  { id: 'biology', label: 'Biology', icon: Microscope, color: 'text-green-600 bg-green-100', path: '/biology', description: 'Microscopy, Dissection, Ecology' },
];

const quickLinks = [
  { label: 'WAEC Syllabus', path: '/syllabus', icon: BookOpen },
  { label: 'Past Questions', path: '/past-questions', icon: HelpCircle },
  { label: 'Achievements', path: '/achievements', icon: Award },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, activeSubject } = useLabStore();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Subject navigation"
      >
        <div className="flex h-full flex-col">
          <nav className="flex-1 p-4 space-y-3 overflow-y-auto" aria-label="Subjects">
            {subjectItems.map((subject) => {
              const Icon = subject.icon;
              const isActive = location.pathname.startsWith(subject.path) || activeSubject === subject.id;
              return (
                <Link
                  key={subject.id}
                  to={subject.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl p-3 transition-all',
                    isActive
                      ? `${subject.color.replace('text-', 'bg-').replace('bg-', 'bg-')} text-white shadow-md`
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', isActive ? 'bg-white/20' : subject.color.replace('text-', 'bg-'))}>
                    <Icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-white')} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-semibold truncate', isActive ? 'text-white' : 'text-slate-900')}>
                      {subject.label}
                    </p>
                    <p className={cn('text-xs truncate', isActive ? 'text-white/80' : 'text-slate-500')}>
                      {subject.description}
                    </p>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-white/80" />}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Quick Links</h3>
            <nav className="space-y-2" aria-label="Quick links">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-slate-200">
            <Link to="/help" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
              Help & Safety Guidelines
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};