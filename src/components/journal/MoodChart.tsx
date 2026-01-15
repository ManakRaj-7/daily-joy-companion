import { useMemo } from 'react';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';

type MoodEntry = {
  mood: string;
  created_at: string;
};

type Props = {
  entries: MoodEntry[];
};

const moodValues: Record<string, number> = {
  stressed: 1,
  anxious: 2,
  neutral: 3,
  calm: 4,
  happy: 5,
  joyful: 6,
};

const moodEmojis: Record<number, string> = {
  1: '😰',
  2: '😟',
  3: '😐',
  4: '😌',
  5: '😊',
  6: '🥰',
};

export function MoodChart({ entries }: Props) {
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const data: { date: string; label: string; value: number | null; emoji: string }[] = [];

    for (let i = 13; i >= 0; i--) {
      const date = subDays(today, i);
      const dayEntries = entries.filter(e => isSameDay(new Date(e.created_at), date));
      
      // Average mood for the day
      const avgMood = dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + (moodValues[e.mood] || 3), 0) / dayEntries.length
        : null;

      data.push({
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'MMM d'),
        value: avgMood ? Math.round(avgMood * 10) / 10 : null,
        emoji: avgMood ? moodEmojis[Math.round(avgMood)] || '😐' : '',
      });
    }

    return data;
  }, [entries]);

  const hasData = chartData.some(d => d.value !== null);

  if (!hasData) {
    return (
      <div className="happify-card text-center py-8">
        <span className="text-4xl mb-3 block">📊</span>
        <p className="text-muted-foreground">Start logging moods to see your trends!</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0].value) {
      const value = payload[0].value;
      const emoji = moodEmojis[Math.round(value)] || '😐';
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-2xl">{emoji}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="happify-card">
      <h3 className="font-display font-semibold mb-4">Mood Trends (Last 2 Weeks)</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[1, 6]} 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => moodEmojis[value] || ''}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#moodGradient)"
              connectNulls
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
        <span>😰 Low</span>
        <span className="text-foreground">→</span>
        <span>🥰 High</span>
      </div>
    </div>
  );
}