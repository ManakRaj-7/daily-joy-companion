import { useMemo } from 'react';
import { format, subDays, startOfDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Flame, Trophy } from 'lucide-react';

type HabitLog = {
  date: string;
  completed: number;
  total: number;
};

type Props = {
  logs: HabitLog[];
};

// Helper to compare dates by their YYYY-MM-DD string representation
const isSameDateString = (dateStr: string, date: Date): boolean => {
  const formatted = format(date, 'yyyy-MM-dd');
  return dateStr === formatted;
};

export function HabitStreak({ logs }: Props) {
  const { currentStreak, longestStreak, last7Days } = useMemo(() => {
    const today = startOfDay(new Date());
    const todayStr = format(today, 'yyyy-MM-dd');
    
    // Calculate last 7 days for display
    const last7: { date: Date; dateStr: string; completed: number; total: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = logs.find(l => l.date === dateStr);
      last7.push({
        date,
        dateStr,
        completed: log?.completed || 0,
        total: log?.total || 0,
      });
    }

    // Calculate current streak - check consecutive days from today backwards
    let current = 0;
    let streakStarted = false;
    
    for (let i = 0; i <= 30; i++) {
      const checkDate = subDays(today, i);
      const checkDateStr = format(checkDate, 'yyyy-MM-dd');
      const log = logs.find(l => l.date === checkDateStr);
      
      // If we have a log for this day and all habits are complete
      if (log && log.completed === log.total && log.total > 0) {
        current++;
        streakStarted = true;
      } else if (log && log.total > 0 && log.completed < log.total) {
        // Day exists but not all habits completed
        if (streakStarted) {
          // Already had a streak going, break it
          break;
        } else if (i === 0) {
          // Today is incomplete, no streak starts
          break;
        } else {
          break;
        }
      } else if (i === 0) {
        // Today has no habits yet - that's okay, check yesterday
        continue;
      } else {
        // No habits for this day - break streak only if we've started
        if (streakStarted) break;
        // If no streak started and no habits, keep looking back
        continue;
      }
    }

    // Calculate longest streak by sorting and checking consecutive completion dates
    let longest = 0;
    let tempStreak = 0;
    
    const sortedLogs = [...logs]
      .filter(l => l.completed === l.total && l.total > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    for (let i = 0; i < sortedLogs.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = parseISO(sortedLogs[i - 1].date);
        const currDate = parseISO(sortedLogs[i].date);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longest = Math.max(longest, tempStreak);
    }

    return { currentStreak: current, longestStreak: longest, last7Days: last7 };
  }, [logs]);

  return (
    <div className="happify-card">
      {/* Streak Stats */}
      <div className="flex gap-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-happify-coral to-happify-warm flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-happify-lavender to-happify-sky flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">This Week</h4>
        <div className="flex justify-between gap-2">
          {last7Days.map(({ date, dateStr, completed, total }) => {
            const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
            const isPerfect = completed === total && total > 0;
            const hasPartial = completed > 0 && completed < total;
            
            return (
              <div key={dateStr} className="flex-1 text-center">
                <div
                  className={cn(
                    "w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    isPerfect && "bg-gradient-to-br from-happify-sage to-happify-sage-dark text-white",
                    hasPartial && "bg-happify-sage-light text-happify-sage-dark",
                    !isPerfect && !hasPartial && total === 0 && "bg-muted text-muted-foreground",
                    !isPerfect && !hasPartial && total > 0 && "bg-destructive/10 text-destructive",
                    isToday && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {isPerfect ? '✓' : hasPartial ? `${completed}` : total > 0 ? '×' : '·'}
                </div>
                <p className={cn(
                  "text-xs mt-1",
                  isToday ? "font-semibold text-foreground" : "text-muted-foreground"
                )}>
                  {format(date, 'EEE')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}