import React from 'react';
import { TrendingUp, Target, Award, Clock, BookOpen, FlaskConical, Microscope, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { SubjectProgressCard } from '../../components/common/ProgressRing';
import { cn } from '../../lib/utils';

const overallStats = [
  { label: 'Overall Progress', value: '0%', icon: TrendingUp, color: 'text-blue-600 bg-blue-100' },
  { label: 'Practicals Done', value: '0/15', icon: Award, color: 'text-green-600 bg-green-100' },
  { label: 'Study Hours', value: '0h', icon: Clock, color: 'text-orange-600 bg-orange-100' },
  { label: 'Average Score', value: '--', icon: Target, color: 'text-purple-600 bg-purple-100' },
];

const weeklyData: { day: string; physics: number; chemistry: number; biology: number }[] = [];

const scoreHistory: { date: string; physics: number; chemistry: number; biology: number }[] = [];

const practicalDetails: { subject: string; title: string; slug: string; completed: boolean; score: number | null; attempts: number; timeSpent: string; lastAttempt: string }[] = [];

const achievements: { id: string; name: string; description: string; icon: typeof Award; unlocked: boolean; unlockedAt?: string; progress?: number; total?: number }[] = [];

export const ProgressPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'details' | 'achievements'>('overview');

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Progress & Analytics</h1>
          <p className="mt-1 text-slate-600">Track your WAEC practical preparation journey.</p>
        </div>

        <div className="mb-6 border-b border-slate-200">
          <nav className="flex gap-8" aria-label="Progress tabs">
            {(['overview', 'details', 'achievements'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'pb-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab
                    ? 'border-lab-green text-lab-green'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {overallStats.map((stat) => (
                <Card key={stat.label} className="hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={cn('flex h-14 w-14 items-center justify-center rounded-xl', stat.color)}>
                      <stat.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={cn('text-sm font-medium', stat.trendUp ? 'text-emerald-600' : 'text-red-600')}>
                      {stat.trendUp ? <ArrowUpRight className="h-3.5 w-3.5 inline mr-1" /> : <ArrowDownRight className="h-3.5 w-3.5 inline mr-1" />}
                      {stat.trend} vs last week
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {[
                { subject: 'physics', completed: 3, total: 5 },
                { subject: 'chemistry', completed: 2, total: 5 },
                { subject: 'biology', completed: 5, total: 5 },
              ].map((sp) => (
                <SubjectProgressCard
                  key={sp.subject}
                  subject={sp.subject as 'physics' | 'chemistry' | 'biology'}
                  completed={sp.completed}
                  total={sp.total}
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 mb-6">Weekly Study Hours</h3>
                  <div className="h-64 flex items-end justify-around">
                    {weeklyData.map((day) => (
                      <div key={day.day} className="flex flex-col items-center gap-2 w-full">
                        <div className="flex gap-1 w-full h-full items-end">
                          {[
                            { subject: 'physics', value: day.physics, color: 'bg-blue-500', max: 4 },
                            { subject: 'chemistry', value: day.chemistry, color: 'bg-orange-500', max: 3 },
                            { subject: 'biology', value: day.biology, color: 'bg-green-500', max: 4 },
                          ].map((d) => (
                            <div
                              key={d.subject}
                              className={cn('flex-1 rounded-t transition-all', d.color)}
                              style={{ height: `${(d.value / 4) * 100}%` }}
                              title={`${d.subject}: ${d.value}h`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">{day.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Physics</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500" /> Chemistry</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> Biology</span>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 mb-6">Score Trend (Last 6 Weeks)</h3>
                  <div className="h-64 relative">
                    <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="physicsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="chemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="bioGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      <g strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        {[
                          { data: scoreHistory.map(d => d.physics), color: '#3b82f6', grad: 'physicsGrad' },
                          { data: scoreHistory.map(d => d.chemistry), color: '#f97316', grad: 'chemGrad' },
                          { data: scoreHistory.map(d => d.biology), color: '#22c55e', grad: 'bioGrad' },
                        ].map((series) => {
                          const points = series.data.map((score, i) => ({
                            x: 50 + i * 100,
                            y: 180 - ((score - 65) / 30) * 150,
                          }));
                          const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                          const areaPath = path + ` L${points[points.length - 1].x} 180 L${points[0].x} 180 Z`;
                          
                          return (
                            <g key={series.color}>
                              <path d={areaPath} fill={`url(#${series.grad})`} />
                              <path d={path} stroke={series.color} strokeWidth="3" />
                              {points.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r={4} fill={series.color} stroke="white" strokeWidth={2} />
                              ))}
                            </g>
                          );
                        })}
                      </g>
                      
                      <g fontSize="10" fill="#94a3b8" textAnchor="middle">
                        {scoreHistory.map((d, i) => (
                          <text key={i} x={50 + i * 100} y={195}>{d.date}</text>
                        ))}
                      </g>
                      <g fontSize="10" fill="#94a3b8" textAnchor="end">
                        {[65, 80, 95].map(v => (
                          <text key={v} x={40} y={180 - ((v - 65) / 30) * 150} dominantBaseline="middle">{v}%</text>
                        ))}
                      </g>
                    </svg>
                    <div className="absolute bottom-4 left-6 flex gap-4 text-xs">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Physics</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500" /> Chemistry</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> Biology</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Search practicals..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-lab-green focus:border-transparent"
                />
              </div>
              <select className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-lab-green focus:border-transparent">
                <option value="all">All Subjects</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
              </select>
              <select className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-lab-green focus:border-transparent">
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="not_started">Not Started</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                  <tr>
                    <th className="p-4 font-mono">Practical</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 font-mono">Score</th>
                    <th className="p-4">Attempts</th>
                    <th className="p-4">Time Spent</th>
                    <th className="p-4">Last Attempt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {practicalDetails.map((prac, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-medium text-slate-900">{prac.title}</p>
                        <p className="text-xs text-slate-500">WAEC Code: {prac.subject === 'Physics' ? 'PHY' : prac.subject === 'Chemistry' ? 'CHEM' : 'BIO'}-PR-{String(idx + 1).padStart(2, '0')}</p>
                      </td>
                      <td className="p-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', prac.subject === 'physics' && 'bg-blue-100 text-blue-700', prac.subject === 'chemistry' && 'bg-orange-100 text-orange-700', prac.subject === 'biology' && 'bg-green-100 text-green-700')}>
                          {prac.subject.charAt(0).toUpperCase() + prac.subject.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        {prac.completed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Completed
                          </span>
                        ) : prac.attempts > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">In Progress</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Not Started</span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {prac.score !== null ? `${prac.score}%` : '—'}
                      </td>
                      <td className="p-4 text-slate-600">{prac.attempts}</td>
                      <td className="p-4 font-mono text-slate-600">{prac.timeSpent}</td>
                      <td className="p-4 text-sm text-slate-500">{prac.lastAttempt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={cn('p-6 relative overflow-hidden', achievement.unlocked ? '' : 'opacity-60 grayscale')}>
                  <div className="absolute top-3 right-3">
                    {achievement.unlocked ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                        <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-4" style={{ backgroundColor: achievement.unlocked ? 'hsl(var(--lab-green-light))' : '#f1f5f9' }}>
                    <achievement.icon className={cn('h-6 w-6', achievement.unlocked ? 'text-lab-green' : 'text-slate-400')} />
                  </div>
                  
                  <h4 className="font-semibold text-slate-900 mb-1">{achievement.name}</h4>
                  <p className="text-sm text-slate-500 mb-3">{achievement.description}</p>
                  
                  {achievement.unlocked ? (
                    <p className="text-xs text-emerald-600">Unlocked: {achievement.unlockedAt}</p>
                  ) : achievement.progress !== undefined ? (
                    <div className="space-y-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-lab-green transition-all" style={{ width: `${(achievement.progress / achievement.total) * 100}%` }} />
                      </div>
                      <p className="text-xs text-slate-500">{achievement.progress} of {achievement.total} completed</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Locked</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};