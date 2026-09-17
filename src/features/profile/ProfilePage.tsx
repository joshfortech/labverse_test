import React from 'react';
import { User, Settings, Award, TrendingUp, Target, LogOut, Edit2, Save } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useLabStore } from '../../stores/labStore';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { useToast } from '../../components/common/Toast';
import { cn } from '../../lib/utils';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { theme, setTheme, soundEnabled, setSoundEnabled } = useLabStore();
  const { show } = useToast();

  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    full_name: user?.full_name || '',
    school_name: user?.school_name || '',
    target_waec_year: user?.target_waec_year || 2026,
    email: '',
  });

  const handleSave = async () => {
    try {
      await updateProfile({
        full_name: formData.full_name,
        school_name: formData.school_name,
        target_waec_year: formData.target_waec_year,
      });
      show({ type: 'success', title: 'Profile updated', message: 'Your changes have been saved.' });
      setIsEditing(false);
    } catch (error) {
      show({ type: 'error', title: 'Error', message: 'Failed to update profile.' });
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      school_name: user?.school_name || '',
      target_waec_year: user?.target_waec_year || 2026,
      email: '',
    });
    setIsEditing(false);
  };

  const stats = [
    { label: 'Practicals Completed', value: '12', icon: Award, color: 'text-blue-600 bg-blue-100' },
    { label: 'Hours Practiced', value: '24h', icon: TrendingUp, color: 'text-green-600 bg-green-100' },
    { label: 'Average Score', value: '87%', icon: Target, color: 'text-orange-600 bg-orange-100' },
    { label: 'Current Streak', value: '7 days', icon: Target, color: 'text-purple-600 bg-purple-100' },
  ];

  const subjectProgress = [
    { subject: 'Physics', completed: 4, total: 5, color: 'blue', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { subject: 'Chemistry', completed: 3, total: 5, color: 'orange', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14.042v.821m-5.071-5.071l1.414 1.414M15 10h2.5M15 14h2.5M5.636 5.636l1.414 1.414M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.5 9.5l4.5 4.5" /></svg> },
    { subject: 'Biology', completed: 5, total: 5, color: 'green', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  ];

  const recentActivity = [
    { action: 'Completed Simple Pendulum Experiment', subject: 'Physics', score: 92, time: '2 hours ago' },
    { action: 'Recorded 5th titration trial', subject: 'Chemistry', score: 88, time: '1 day ago' },
    { action: 'Identified all onion cell structures', subject: 'Biology', score: 95, time: '3 days ago' },
    { action: 'Submitted Ohm\'s Law worksheet', subject: 'Physics', score: 90, time: '5 days ago' },
    { action: 'Completed leaf stomata observation', subject: 'Biology', score: 85, time: '1 week ago' },
  ];

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Profile & Settings</h1>
          <p className="mt-1 text-slate-600">Manage your account, preferences, and view your progress.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-lab-green-light">
                  <User className="h-10 w-10 text-lab-green" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{user?.full_name || 'Student'}</h2>
                  <p className="text-sm text-slate-500">{user?.school_name || 'No school specified'}</p>
                  <p className="text-xs text-slate-400">Target WAEC: {user?.target_waec_year || 2026}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <stat.icon className={cn('h-4 w-4', stat.color)} />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Dark Mode</p>
                      <p className="text-xs text-slate-500">Toggle dark/light theme</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                    {theme === 'light' ? 'Enable' : 'Disable'}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                      <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1m8.943 12.214a9.962 9.962 0 01-4.516-1.237l-2.143 2.143A12.06 12.06 0 0015.536 18.464a12.06 12.06 0 006.273-2.25l2.143 2.143A12.06 12.06 0 0114.52 21c-3.314 0-6.332-.92-8.935-2.523" /></svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Sound Effects</p>
                      <p className="text-xs text-slate-500">Enable lab interaction sounds</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                    {soundEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Save</Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}><Edit2 className="h-4 w-4 mr-2" /> Edit Profile</Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={formData.school_name}
                    onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Springfield High School"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetYear">Target WAEC Year</Label>
                  <Input
                    id="targetYear"
                    type="number"
                    value={formData.target_waec_year}
                    onChange={(e) => setFormData({ ...formData, target_waec_year: parseInt(e.target.value) || 2026 })}
                    disabled={!isEditing}
                    min="2024"
                    max="2030"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || 'student@school.edu'}
                    disabled
                    placeholder="student@school.edu"
                  />
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Subject Progress</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {subjectProgress.map((sp) => (
                  <div key={sp.subject} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', `bg-${sp.color}-100`)}>
                          {sp.icon}
                        </div>
                        <h3 className="font-semibold text-slate-900">{sp.subject}</h3>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{(sp.completed / sp.total * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 mb-2">
                      <div
                        className={cn('h-full transition-all duration-1000', `bg-${sp.color}-600`)}
                        style={{ width: `${(sp.completed / sp.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-500">{sp.completed} of {sp.total} practicals completed</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                        {activity.subject === 'Physics' && <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        {activity.subject === 'Chemistry' && <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14.042v.821m-5.071-5.071l1.414 1.414M15 10h2.5M15 14h2.5M5.636 5.636l1.414 1.414M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.5 9.5l4.5 4.5" /></svg>}
                        {activity.subject === 'Biology' && <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{activity.action}</p>
                        <p className="text-sm text-slate-500">{activity.subject} • {activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">{activity.score}%</p>
                      <p className="text-xs text-slate-500">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-red-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                  <LogOut className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Danger Zone</h3>
                  <p className="text-sm text-slate-500">Sign out from all devices</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4 border-red-300 text-red-600 hover:bg-red-50" onClick={() => useAuthStore.getState().signOut()}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};