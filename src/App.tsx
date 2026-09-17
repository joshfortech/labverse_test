import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { useLabStore } from './stores/labStore';
import { Dashboard } from './components/common/Dashboard';
import { PendulumLab } from './features/simulators/physics/PendulumLab';
import { TitrationLab } from './features/simulators/chemistry/TitrationLab';
import { MicroscopeLab } from './features/simulators/biology/MicroscopeLab';
import { LoginPage, RegisterPage } from './features/auth/AuthPage';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer, useToast } from './components/common/Toast';

const ProfilePage = lazy(() => import('./features/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ProgressPage = lazy(() => import('./features/progress/ProgressPage').then(m => ({ default: m.ProgressPage })));
const SyllabusPage = lazy(() => import('./features/syllabus/SyllabusPage').then(m => ({ default: m.SyllabusPage })));
const PastQuestionsPage = lazy(() => import('./features/past-questions/PastQuestionsPage').then(m => ({ default: m.PastQuestionsPage })));
const AchievementsPage = lazy(() => import('./features/achievements/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const HelpPage = lazy(() => import('./features/help/HelpPage').then(m => ({ default: m.HelpPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuthStore();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    useLabStore.getState().loadAllStates();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-lab-green mb-4">
            <svg className="h-7 w-7 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
          </div>
          <p className="text-slate-600">Loading Labverse...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const AppLayout: React.FC = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Sidebar />
      <main className="lg:ml-72 pt-16 bg-slate-50">
        <Outlet />
      </main>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

const AuthLayout: React.FC = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/physics" element={<PendulumLab />} />
              <Route path="/physics/pendulum" element={<PendulumLab />} />
              <Route path="/chemistry" element={<TitrationLab />} />
              <Route path="/chemistry/titration" element={<TitrationLab />} />
              <Route path="/biology" element={<MicroscopeLab />} />
              <Route path="/biology/microscope" element={<MicroscopeLab />} />
              <Route path="/profile" element={<Suspense fallback={<div className="p-8">Loading...</div>}><ProfilePage /></Suspense>} />
              <Route path="/progress" element={<Suspense fallback={<div className="p-8">Loading...</div>}><ProgressPage /></Suspense>} />
              <Route path="/syllabus" element={<Suspense fallback={<div className="p-8">Loading...</div>}><SyllabusPage /></Suspense>} />
              <Route path="/past-questions" element={<Suspense fallback={<div className="p-8">Loading...</div>}><PastQuestionsPage /></Suspense>} />
              <Route path="/achievements" element={<Suspense fallback={<div className="p-8">Loading...</div>}><AchievementsPage /></Suspense>} />
              <Route path="/help" element={<Suspense fallback={<div className="p-8">Loading...</div>}><HelpPage /></Suspense>} />
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
