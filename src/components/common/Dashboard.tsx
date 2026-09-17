import React from 'react';
import { FlaskConical, Microscope, Award, TrendingUp, Target, Clock, Brain } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { SubjectProgressCard } from './ProgressRing';
import { useAuthStore } from '../../stores/authStore';
import { useLabStore } from '../../stores/labStore';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Practicals Completed', value: '12', icon: FlaskConical, color: 'text-blue-600 bg-blue-100' },
  { label: 'Hours Practiced', value: '24h', icon: Clock, color: 'text-green-600 bg-green-100' },
  { label: 'Average Score', value: '87%', icon: TrendingUp, color: 'text-orange-600 bg-orange-100' },
  { label: 'Streak', value: '7 days', icon: Target, color: 'text-purple-600 bg-purple-100' },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { setActiveSubject } = useLabStore();

  const subjectProgress = [
    { subject: 'physics' as const, completed: 4, total: 5 },
    { subject: 'chemistry' as const, completed: 3, total: 5 },
    { subject: 'biology' as const, completed: 5, total: 5 },
  ];

  return (
    <div className="p-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="mt-1 text-slate-600">Continue your WAEC practical preparation journey.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', stat.color)}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {subjectProgress.map((sp) => (
            <SubjectProgressCard
              key={sp.subject}
              subject={sp.subject}
              completed={sp.completed}
              total={sp.total}
              onClick={() => setActiveSubject(sp.subject)}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
                  <p className="text-sm text-slate-500">Pick up where you left off</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lab-green-light">
                  <Brain className="h-6 w-6 text-lab-green" />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'Simple Pendulum Experiment', subject: 'Physics', progress: 60, path: '/physics/pendulum' },
                  { title: 'Acid-Base Titration', subject: 'Chemistry', progress: 45, path: '/chemistry/titration' },
                  { title: 'Onion Epidermal Cell', subject: 'Biology', progress: 80, path: '/biology/microscope' },
                ].map((item) => (
                  <Link
                    key={item.title}
                    to={item.path}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                        {item.subject === 'Physics' && <FlaskConical className="h-5 w-5 text-blue-600" />}
                        {item.subject === 'Chemistry' && <FlaskConical className="h-5 w-5 text-orange-600" />}
                        {item.subject === 'Biology' && <Microscope className="h-5 w-5 text-green-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{item.progress}%</p>
                      <div className="w-32 h-1.5 mt-1 rounded-full bg-slate-200">
                        <div
                          className={cn('h-full rounded-full', item.subject === 'Physics' && 'bg-blue-600', item.subject === 'Chemistry' && 'bg-orange-600', item.subject === 'Biology' && 'bg-green-600')}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild variant="outline" className="h-24 flex flex-col items-start justify-center gap-3 p-4 text-left">
                  <Link to="/physics/pendulum">
                    <FlaskConical className="h-8 w-8 text-blue-600" />
                    <span className="font-semibold text-slate-900">Physics Lab</span>
                    <span className="text-xs text-slate-500">Pendulum, Optics, Waves</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-24 flex flex-col items-start justify-center gap-3 p-4 text-left">
                  <Link to="/chemistry/titration">
                    <FlaskConical className="h-8 w-8 text-orange-600" />
                    <span className="font-semibold text-slate-900">Chemistry Lab</span>
                    <span className="text-xs text-slate-500">Titration, Analysis</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-24 flex flex-col items-start justify-center gap-3 p-4 text-left">
                  <Link to="/biology/microscope">
                    <Microscope className="h-8 w-8 text-green-600" />
                    <span className="font-semibold text-slate-900">Biology Lab</span>
                    <span className="text-xs text-slate-500">Microscopy, Dissection</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-24 flex flex-col items-start justify-center gap-3 p-4 text-left">
                  <Link to="/progress">
                    <Award className="h-8 w-8 text-purple-600" />
                    <span className="font-semibold text-slate-900">My Progress</span>
                    <span className="text-xs text-slate-500">Scores, Analytics, Reports</span>
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
