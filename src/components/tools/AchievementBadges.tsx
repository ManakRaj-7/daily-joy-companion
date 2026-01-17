import { useState, useEffect } from 'react';
import { badges, Badge } from '@/data/badges';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Trophy, Lock } from 'lucide-react';
import { format, subDays } from 'date-fns';

export function AchievementBadges() {
  const { user } = useAuth();
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [stats, setStats] = useState({ streak: 0, totalHabits: 0, gratitudeCount: 0, kindnessCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch all completed habits
      const { data: habitsData } = await supabase
        .from('happiness_habits')
        .select('date, completed')
        .eq('user_id', user.id)
        .eq('completed', true);

      // Calculate total completed habits
      const totalHabits = habitsData?.length || 0;

      // Calculate current streak
      let streak = 0;
      if (habitsData && habitsData.length > 0) {
        const habitsByDate = habitsData.reduce((acc, h) => {
          acc[h.date] = (acc[h.date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const today = new Date();
        let checkDate = today;
        
        // Check if today has any completed habits, otherwise start from yesterday
        const todayStr = format(today, 'yyyy-MM-dd');
        if (!habitsByDate[todayStr]) {
          checkDate = subDays(today, 1);
        }

        while (true) {
          const dateStr = format(checkDate, 'yyyy-MM-dd');
          if (habitsByDate[dateStr]) {
            streak++;
            checkDate = subDays(checkDate, 1);
          } else {
            break;
          }
        }
      }

      // Fetch gratitude count
      const { count: gratitudeCount } = await supabase
        .from('gratitude_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch kindness count
      const { count: kindnessCount } = await supabase
        .from('kindness_challenges' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const newStats = {
        streak,
        totalHabits,
        gratitudeCount: gratitudeCount || 0,
        kindnessCount: kindnessCount || 0,
      };

      setStats(newStats);

      // Determine unlocked badges
      const unlocked: string[] = [];
      for (const badge of badges) {
        let value = 0;
        switch (badge.type) {
          case 'streak': value = newStats.streak; break;
          case 'total': value = newStats.totalHabits; break;
          case 'gratitude': value = newStats.gratitudeCount; break;
          case 'kindness': value = newStats.kindnessCount; break;
        }
        if (value >= badge.requirement) {
          unlocked.push(badge.id);
        }
      }
      setUnlockedBadges(unlocked);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    
    setIsLoading(false);
  };

  const getBadgeProgress = (badge: Badge) => {
    let current = 0;
    switch (badge.type) {
      case 'streak': current = stats.streak; break;
      case 'total': current = stats.totalHabits; break;
      case 'gratitude': current = stats.gratitudeCount; break;
      case 'kindness': current = stats.kindnessCount; break;
    }
    return Math.min((current / badge.requirement) * 100, 100);
  };

  const categorizedBadges = {
    streak: badges.filter(b => b.type === 'streak'),
    total: badges.filter(b => b.type === 'total'),
    gratitude: badges.filter(b => b.type === 'gratitude'),
    kindness: badges.filter(b => b.type === 'kindness'),
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Sign in to track your achievements</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-center">
          <p className="text-3xl font-bold">{stats.streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-happify-sage/10 to-happify-sage/5 text-center">
          <p className="text-3xl font-bold">{stats.totalHabits}</p>
          <p className="text-xs text-muted-foreground">Habits Done</p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-happify-warm/10 to-happify-warm/5 text-center">
          <p className="text-3xl font-bold">{stats.gratitudeCount}</p>
          <p className="text-xs text-muted-foreground">Gratitudes</p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-happify-coral/10 to-happify-coral/5 text-center">
          <p className="text-3xl font-bold">{stats.kindnessCount}</p>
          <p className="text-xs text-muted-foreground">Kind Acts</p>
        </div>
      </div>

      {/* Unlocked Count */}
      <div className="flex items-center justify-center gap-2 py-2">
        <Trophy className="w-5 h-5 text-happify-warm" />
        <span className="font-medium">
          {unlockedBadges.length} / {badges.length} Badges Unlocked
        </span>
      </div>

      {/* Badge Categories */}
      {Object.entries(categorizedBadges).map(([category, categoryBadges]) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
            {category === 'total' ? 'Total Habits' : category} Badges
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {categoryBadges.map((badge) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              const progress = getBadgeProgress(badge);
              
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "relative p-4 rounded-2xl text-center transition-all",
                    isUnlocked
                      ? "bg-gradient-to-br from-happify-warm-light to-happify-coral-light border border-happify-warm/20"
                      : "bg-muted/50 opacity-60"
                  )}
                >
                  <div className="text-3xl mb-2">
                    {isUnlocked ? badge.emoji : <Lock className="w-6 h-6 mx-auto text-muted-foreground" />}
                  </div>
                  <p className="font-medium text-xs leading-tight">{badge.name}</p>
                  
                  {!isUnlocked && (
                    <div className="mt-2">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/50 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {Math.round(progress)}%
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
