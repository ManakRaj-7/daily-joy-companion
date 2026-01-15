import { useMemo } from 'react';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
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

export function HabitStreak({ logs }: Props) {
  const { currentStreak, longestStreak, last7Days } = useMemo(() => {
    // Calculate last 7 days for display
    const today = startOfDay(new Date());
    const last7: { date: Date; completed: number; total: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const log = logs.find(l => isSameDay(new Date(l.date), date));
      last7.push({
        date,
        completed: log?.completed || 0,
        total: log?.total || 0,
      });
    }

    // Calculate current streak
    let current = 0;
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];
      const logDate = startOfDay(new Date(log.date));
      const expectedDate = subDays(today, i);
      
      if (isSameDay(logDate, expectedDate) && log.completed === log.total && log.total > 0) {
        current++;
      } else if (!isSameDay(logDate, expectedDate)) {
        break;
      } else {
        break;
      }
    }

    // Calculate longest streak (simplified - just look at consecutive days)
    let longest = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];
      if (log.completed === log.total && log.total > 0) {
        tempStreak++;
        longest = Math.max(longest, tempStreak);
      } else {
        tempStreak = 0;
      }
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
          {last7Days.map(({ date, completed, total }) => {
            const isToday = isSameDay(date, new Date());
            const isPerfect = completed === total && total > 0;
            const hasPartial = completed > 0 && completed < total;
            
            return (
              <div key={date.toISOString()} className="flex-1 text-center">
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