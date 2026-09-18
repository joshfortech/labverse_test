import React from 'react';
import { Award, Trophy, Target, Flame, Star, Zap, BookOpen, Clock, CheckCircle, Sparkles, Circle as CircleIcon, Gem as GemIcon, Crown as CrownIcon } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { ProgressRing } from '../../components/common/ProgressRing';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const achievementCategories = [
  {
    id: 'completion',
    name: 'Completion',
    icon: CheckCircle,
    color: 'emerald',
    achievements: [
      { id: 'first_practical', name: 'First Steps', description: 'Complete your first practical simulation', icon: Award, requirement: 1, current: 0, unlocked: false, unlockedAt: undefined, rarity: 'common' },
      { id: 'physics_complete', name: 'Physics Prodigy', description: 'Complete all 5 Physics practicals', icon: Award, requirement: 5, current: 0, unlocked: false, progress: 0, total: 5, unlockedAt: undefined, rarity: 'rare' },
      { id: 'chemistry_complete', name: 'Chemistry Champion', description: 'Complete all 5 Chemistry practicals', icon: Award, requirement: 5, current: 0, unlocked: false, progress: 0, total: 5, unlockedAt: undefined, rarity: 'rare' },
      { id: 'biology_complete', name: 'Biology Buff', description: 'Complete all 5 Biology practicals', icon: Award, requirement: 5, current: 0, unlocked: false, progress: 0, total: 5, unlockedAt: undefined, rarity: 'rare' },
      { id: 'all_complete', name: 'Triple Threat', description: 'Complete at least one practical in each subject', icon: Trophy, requirement: 3, current: 0, unlocked: false, progress: 0, total: 3, unlockedAt: undefined, rarity: 'epic' },
      { id: 'master_all', name: 'Labverse Master', description: 'Complete all 15 practicals across all subjects', icon: Trophy, requirement: 15, current: 0, unlocked: false, progress: 0, total: 15, unlockedAt: undefined, rarity: 'legendary' },
    ],
  },
  {
    id: 'mastery',
    name: 'Mastery',
    icon: Star,
    color: 'amber',
    achievements: [
      { id: 'perfect_score', name: 'Perfectionist', description: 'Score 100% on any practical', icon: Star, requirement: 100, current: 0, unlocked: false, unlockedAt: undefined, rarity: 'epic' },
      { id: 'high_scorer', name: 'High Achiever', description: 'Maintain an average score of 90%+', icon: Star, requirement: 90, current: 0, unlocked: false, unlockedAt: undefined, rarity: 'rare' },
      { id: 'consistent_90', name: 'Consistency King', description: 'Score 90%+ on 5 consecutive practicals', icon: Star, requirement: 5, current: 0, unlocked: false, progress: 0, total: 5, unlockedAt: undefined, rarity: 'epic' },
      { id: 'no_mistakes', name: 'Flawless Execution', description: 'Complete a practical with zero errors', icon: Sparkles, requirement: 1, current: 0, unlocked: false, unlockedAt: undefined, rarity: 'legendary' },
      { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a practical in under 50% of allocated time', icon: Zap, requirement: 1, current: 0, unlocked: false, unlockedAt: undefined, rarity: 'rare' },
    ],
  },
  {
    id: 'streaks',
    name: 'Streaks & Consistency',
    icon: Flame,
    color: 'orange',
    achievements: [
      { id: 'streak_3', name: 'Getting Started', description: '3-day study streak', icon: Flame, requirement: 3, current: 0, unlocked: false, progress: 0, total: 3, unlockedAt: undefined, rarity: 'common' },
      { id: 'streak_7', name: 'Week Warrior', description: '7-day study streak', icon: Flame, requirement: 7, current: 0, unlocked: false, progress: 0, total: 7, unlockedAt: undefined, rarity: 'common' },
      { id: 'streak_14', name: 'Fortnight Fighter', description: '14-day study streak', icon: Flame, requirement: 14, current: 0, unlocked: false, progress: 0, total: 14, unlockedAt: undefined, rarity: 'rare' },
      { id: 'streak_30', name: 'Monthly Dedication', description: '30-day study streak', icon: Flame, requirement: 30, current: 0, unlocked: false, progress: 0, total: 30, unlockedAt: undefined, rarity: 'epic' },
      { id: 'streak_100', name: 'Century Club', description: '100-day study streak', icon: Flame, requirement: 100, current: 0, unlocked: false, progress: 0, total: 100, unlockedAt: undefined, rarity: 'legendary' },
      { id: 'weekly_regular', name: 'Weekly Regular', description: 'Complete at least 3 practicals per week for 4 weeks', icon: Clock, requirement: 4, current: 0, unlocked: false, progress: 0, total: 4, unlockedAt: undefined, rarity: 'rare' },
    ],
  },
  {
    id: 'exploration',
    name: 'Exploration',
    icon: BookOpen,
    color: 'blue',
    achievements: [
      { id: 'try_all_subjects', name: 'Curious Mind', description: 'Try all three subjects (Physics, Chemistry, Biology)', icon: BookOpen, requirement: 3, current: 0, unlocked: false, progress: 0, total: 3, unlockedAt: undefined, rarity: 'common' },
      { id: 'worksheet_submitter', name: 'Diligent Student', description: 'Submit 10 worksheets for grading', icon: BookOpen, requirement: 10, current: 0, unlocked: false, progress: 0, total: 10, unlockedAt: undefined, rarity: 'rare' },
      { id: 'guide_reader', name: 'Guide Follower', description: 'Read all WAEC guide tips in every practical', icon: BookOpen, requirement: 15, current: 0, unlocked: false, progress: 0, total: 15, unlockedAt: undefined, rarity: 'rare' },
      { id: 'night_owl', name: 'Night Owl', description: 'Complete a practical between 10 PM - 6 AM', icon: BookOpen, requirement: 1, current: 0, unlocked: false, unlockedAt: undefined, rarity: 'common' },
      { id: 'early_bird', name: 'Early Bird', description: 'Complete a practical before 8 AM', icon: BookOpen, requirement: 1, current: 0, unlocked: false, unlockedAt: undefined, rarity: 'common' },
    ],
  },
];

const rarityStyles = {
  common: { border: 'border-slate-300', bg: 'bg-slate-50', text: 'text-slate-600', glow: '' },
  rare: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700', glow: 'shadow-blue-200/50' },
  epic: { border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-700', glow: 'shadow-purple-200/50' },
  legendary: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700', glow: 'shadow-amber-200/50' },
};

const rarityIcons = {
  common: <CircleIcon className="h-3 w-3 text-slate-400" />,
  rare: <GemIcon className="h-4 w-3 text-blue-500" />,
  epic: <Star className="h-4 w-4 text-purple-500" />,
  legendary: <CrownIcon className="h-4 w-4 text-amber-500" />,
};

const getRarityPoints = (rarity: string) => {
  switch (rarity) {
    case 'common': return 10;
    case 'rare': return 50;
    case 'epic': return 200;
    case 'legendary': return 500;
    default: return 0;
  }
};

export const AchievementsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState<string>('completion');
  const [showLocked, setShowLocked] = React.useState(true);

  const allAchievements = achievementCategories.flatMap(c => c.achievements);
  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const totalCount = allAchievements.length;
  const totalPoints = allAchievements.reduce((sum, a) => sum + (a.unlocked ? getRarityPoints(a.rarity) : 0), 0);

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Achievements</h1>
          <p className="mt-1 text-slate-600">Track your progress and earn badges for your WAEC practical journey.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                <Award className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Unlocked</p>
                <p className="text-3xl font-bold text-slate-900">{unlockedCount}/{totalCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100">
                <Star className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Points</p>
                <p className="text-3xl font-bold text-slate-900">{totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100">
                <Target className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Completion</p>
                <ProgressRing progress={(unlockedCount / totalCount) * 100} size={56} strokeWidth={6} color="blue" showPercentage />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100">
                <Flame className="h-7 w-7 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Current Streak</p>
                <p className="text-3xl font-bold text-slate-900">0 days</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-48 flex-shrink-0">
            <Card className="sticky top-24">
              <nav className="space-y-1">
                {achievementCategories.map((category) => {
                  const catAchievements = category.achievements;
                  const catUnlocked = catAchievements.filter(a => a.unlocked).length;
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                        activeCategory === category.id
                          ? 'bg-lab-green-light text-lab-green font-medium'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      <Icon className={cn('h-5 w-5 flex-shrink-0', activeCategory === category.id ? 'text-lab-green' : '')} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{category.name}</p>
                        <p className="text-xs opacity-70">{catUnlocked}/{catAchievements.length}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLocked}
                    onChange={(e) => setShowLocked(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-lab-green focus:ring-lab-green"
                  />
                  Show Locked
                </label>
              </div>
            </Card>
          </div>

          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {achievementCategories.find(c => c.id === activeCategory)?.name} Achievements
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>{achievementCategories.find(c => c.id === activeCategory)?.achievements.filter(a => a.unlocked).length || 0}</span>
                <span className="text-slate-300">/</span>
                <span>{achievementCategories.find(c => c.id === activeCategory)?.achievements.length || 0}</span>
                <span>unlocked</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {achievementCategories.find(c => c.id === activeCategory)?.achievements
                .filter(a => showLocked || a.unlocked)
                .map((achievement) => {
                  const rarity = rarityStyles[achievement.rarity as keyof typeof rarityStyles];
                  const isUnlocked = achievement.unlocked;
                  const progress = achievement.progress !== undefined && achievement.total !== undefined
                    ? (achievement.progress / achievement.total) * 100
                    : achievement.current !== undefined && achievement.requirement !== undefined
                      ? Math.min(100, (achievement.current / achievement.requirement) * 100)
                      : 0;

                  return (
                    <Card
                      key={achievement.id}
                      className={cn(
                        'relative overflow-hidden transition-all hover:shadow-lg',
                        isUnlocked ? '' : 'opacity-60 grayscale',
                        rarity.border,
                        rarity.bg
                      )}
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        {rarityIcons[achievement.rarity as keyof typeof rarityIcons]}
                        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: rarity.text.replace('text-', '') }}>
                          {achievement.rarity}
                        </span>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl shrink-0', isUnlocked ? 'bg-white' : 'bg-slate-200')}>
                            <achievement.icon className={cn('h-8 w-8', isUnlocked ? rarity.text : 'text-slate-400')} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className={cn('font-semibold', isUnlocked ? 'text-slate-900' : 'text-slate-500')}>
                                {achievement.name}
                              </h3>
                              {isUnlocked && (
                                <div className="flex items-center gap-1 text-xs text-emerald-600">
                                  <CheckCircle className="h-3 w-3" />
                                  Unlocked
                                </div>
                              )}
                            </div>
                            <p className={cn('mt-1 text-sm', isUnlocked ? 'text-slate-600' : 'text-slate-400')}>
                              {achievement.description}
                            </p>

                            {achievement.progress !== undefined && achievement.total !== undefined && !isUnlocked && (
                              <div className="mt-3 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className={rarity.text}>Progress</span>
                                  <span className="font-mono">{achievement.progress}/{achievement.total}</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                  <div className={cn('h-full transition-all duration-1000', `bg-${achievement.rarity === 'legendary' ? 'amber' : achievement.rarity === 'epic' ? 'purple' : achievement.rarity === 'rare' ? 'blue' : 'emerald'}-600`)} style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            )}

                            {achievement.current !== undefined && achievement.requirement !== undefined && achievement.progress === undefined && !isUnlocked && (
                              <div className="mt-3 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className={rarity.text}>Progress</span>
                                  <span className="font-mono">{Math.min(achievement.current, achievement.requirement)}/{achievement.requirement}</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                  <div className={cn('h-full transition-all duration-1000', `bg-${achievement.rarity === 'legendary' ? 'amber' : achievement.rarity === 'epic' ? 'purple' : achievement.rarity === 'rare' ? 'blue' : 'emerald'}-600`)} style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            )}

                            {isUnlocked && achievement.unlockedAt && (
                              <p className="mt-3 text-xs text-emerald-600">
                                Unlocked on {achievement.unlockedAt}
                              </p>
                            )}

                            {!isUnlocked && achievement.requirement === 1 && achievement.current === 0 && (
                              <p className="mt-3 text-xs text-slate-400 italic">Keep practicing to unlock!</p>
                            )}
                          </div>
                        </div>

                        {isUnlocked && (
                          <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                            <Badge variant="outline" className={cn('bg-white/50', rarity.border)}>
                              +{getRarityPoints(achievement.rarity)} points
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Sparkles className="h-3 w-3" />
                              Rarety: {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Leaderboard Preview</h2>
          <Card>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200">
                    <tr className="text-sm text-slate-500 uppercase">
                      <th className="pb-3 font-medium">Rank</th>
                      <th className="pb-3 font-medium">Student</th>
                      <th className="pb-3 font-medium">Points</th>
                      <th className="pb-3 font-medium">Achievements</th>
                      <th className="pb-3 font-medium">Streak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { rank: 1, name: 'You', points: totalPoints, achievements: unlockedCount, streak: 0, you: true },
                    ].map((entry) => (
                      <tr key={entry.rank} className={cn('hover:bg-slate-50', entry.you && 'bg-lab-green-light/50')}>
                        <td className="py-3 font-mono font-bold text-slate-900">
                          {entry.rank === 1 && <Trophy className="h-5 w-5 text-amber-500 inline" />}
                          {entry.rank === 2 && <Award className="h-5 w-5 text-slate-400 inline" />}
                          {entry.rank === 3 && <Award className="h-5 w-5 text-amber-700 inline" />}
                          #{entry.rank}
                        </td>
                        <td className="py-3">
                          <div className={cn('flex items-center gap-2 font-medium', entry.you && 'text-lab-green')}>
                            {entry.you && <Sparkles className="h-4 w-4 text-lab-green" />}
                            {entry.name}
                          </div>
                        </td>
                        <td className="py-3 font-mono text-slate-900">{entry.points.toLocaleString()}</td>
                        <td className="py-3 text-slate-600">{entry.achievements}/{totalCount}</td>
                        <td className="py-3 flex items-center gap-1 text-slate-600">
                          <Flame className="h-4 w-4 text-orange-500" />
                          {entry.streak} days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {unlockedCount < 15 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-900">Close to the Top 5!</p>
                    <p className="text-sm text-amber-700">Complete more practicals and maintain your streak to climb the leaderboard.</p>
                  </div>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    Continue Practicing
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};