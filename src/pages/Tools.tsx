import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, Sparkles, Smartphone, Wind, Check, RefreshCw, Loader2, Plus, Timer, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { habitPool, habitCategories, type HabitCategory } from '@/data/habits';
import { meditationScripts, meditationCategories } from '@/data/meditations';
import { BreathingExercise } from '@/components/tools/BreathingExercise';
import { SilenceChallenge } from '@/components/tools/SilenceChallenge';
import { HabitStreak } from '@/components/tools/HabitStreak';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Habit = {
  id: string;
  habit_type: string;
  description: string;
  completed: boolean;
  date: string;
};

type GratitudeEntry = {
  id: string;
  content: string;
  created_at: string;
};

const detoxChallenges = [
  { title: "Phone-free breakfast", desc: "Eat your first meal without looking at your phone", emoji: "🍳" },
  { title: "No phone in bedroom", desc: "Charge your phone outside your bedroom tonight", emoji: "🛏️" },
  { title: "1-hour digital sunset", desc: "Stop screens 1 hour before bed", emoji: "🌅" },
  { title: "Walk without podcasts", desc: "Take a 10-minute walk in silence", emoji: "🚶" },
  { title: "App timeout", desc: "Set a 30-min daily limit on your most-used social app", emoji: "⏰" },
  { title: "Mindful scrolling", desc: "Before opening social media, take 3 breaths", emoji: "🧘" },
  { title: "Notification vacation", desc: "Turn off all notifications for 2 hours", emoji: "🔕" },
  { title: "No phone first hour", desc: "Don't check your phone for the first hour after waking", emoji: "☀️" },
  { title: "Grayscale challenge", desc: "Use your phone in grayscale mode for a day", emoji: "⬛" },
  { title: "One app delete", desc: "Remove one app that steals your attention", emoji: "🗑️" },
];

export default function Tools() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState<'habits' | 'gratitude' | 'meditation' | 'breathing' | 'silence' | 'detox'>('habits');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<{ date: string; completed: number; total: number }[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [newGratitude, setNewGratitude] = useState('');
  const [customHabit, setCustomHabit] = useState('');
  const [customHabitType, setCustomHabitType] = useState<HabitCategory>('body');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMeditationCategory, setSelectedMeditationCategory] = useState('all');
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Fetch today's habits, gratitude entries, and habit history for streaks
    const [habitsRes, gratitudeRes, historyRes] = await Promise.all([
      supabase.from('happiness_habits').select('*').eq('user_id', user.id).eq('date', today),
      supabase.from('gratitude_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('happiness_habits').select('date, completed').eq('user_id', user.id).gte('date', format(subDays(new Date(), 30), 'yyyy-MM-dd'))
    ]);
    
    if (habitsRes.data) setHabits(habitsRes.data);
    if (gratitudeRes.data) setGratitudeEntries(gratitudeRes.data);
    
    // Process habit history for streak calculation
    if (historyRes.data) {
      const grouped = historyRes.data.reduce((acc, h) => {
        if (!acc[h.date]) acc[h.date] = { total: 0, completed: 0 };
        acc[h.date].total++;
        if (h.completed) acc[h.date].completed++;
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);
      
      setHabitLogs(Object.entries(grouped).map(([date, data]) => ({ date, ...data })));
    }
    
    setIsLoading(false);
  };

  const handleRefreshClick = () => {
    if (habits.length > 0 && habits.some(h => h.completed)) {
      setShowRefreshConfirm(true);
    } else {
      generateDailyHabits();
    }
  };

  const generateDailyHabits = async () => {
    if (!user) {
      toast({ title: "Sign in to save habits", variant: "destructive" });
      return;
    }

    setShowRefreshConfirm(false);
    setIsSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Delete existing habits for today first
    await supabase.from('happiness_habits').delete().eq('user_id', user.id).eq('date', today);
    
    // Pick random habits from the expanded pool (one from each category)
    const newHabits = habitCategories.map(cat => ({
      habit_type: cat.id,
      description: habitPool[cat.id][Math.floor(Math.random() * habitPool[cat.id].length)]
    }));

    const { error } = await supabase.from('happiness_habits').insert(
      newHabits.map(h => ({ ...h, user_id: user.id, date: today }))
    );

    if (error) {
      console.error('Habit insert error:', error);
      toast({ title: "Error generating habits", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "New habits generated! 🌱" });
      fetchData();
    }
    setIsSaving(false);
  };

  const addCustomHabit = async () => {
    if (!customHabit.trim() || !user) return;
    
    setIsSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const { error } = await supabase.from('happiness_habits').insert({
      user_id: user.id,
      habit_type: customHabitType,
      description: customHabit.trim(),
      date: today
    });

    if (error) {
      toast({ title: "Couldn't add habit", variant: "destructive" });
    } else {
      toast({ title: "Custom habit added! ✨" });
      setCustomHabit('');
      fetchData();
    }
    setIsSaving(false);
  };

  const toggleHabit = async (id: string, completed: boolean) => {
    const { error } = await supabase.from('happiness_habits').update({ completed: !completed }).eq('id', id);
    if (!error) {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !completed } : h));
      if (!completed) toast({ title: "Great job! ✨" });
    }
  };

  const saveGratitude = async () => {
    if (!newGratitude.trim()) return;
    if (!user) {
      toast({ title: "Sign in to save gratitude", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from('gratitude_entries').insert({
      user_id: user.id,
      content: newGratitude.trim()
    });

    if (error) {
      toast({ title: "Error saving", variant: "destructive" });
    } else {
      toast({ title: "Gratitude noted! 💕" });
      setNewGratitude('');
      fetchData();
    }
    setIsSaving(false);
  };

  const sections = [
    { id: 'habits', label: 'Daily Habits', icon: Sparkles },
    { id: 'gratitude', label: 'Gratitude', icon: Heart },
    { id: 'meditation', label: 'Meditation', icon: Wind },
    { id: 'breathing', label: 'Breathing', icon: Wind },
    { id: 'silence', label: 'Silence', icon: Timer },
    { id: 'detox', label: 'Digital Detox', icon: Smartphone },
  ];

  const getHabitEmoji = (type: string) => {
    const cat = habitCategories.find(c => c.id === type);
    return cat?.label.split(' ')[0] || '✨';
  };

  const filteredMeditations = selectedMeditationCategory === 'all' 
    ? meditationScripts 
    : meditationScripts.filter(m => m.category === selectedMeditationCategory);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">Happiness Tools</h1>
          <p className="text-muted-foreground">Small practices for a lighter day</p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeSection === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Daily Habits */}
        {activeSection === 'habits' && (
          <div className="space-y-4">
            {/* Streak Component */}
            {habitLogs.length > 0 && <HabitStreak logs={habitLogs} />}
            
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Today's Habits</h3>
              <Button size="sm" variant="outline" onClick={handleRefreshClick} disabled={isSaving} className="rounded-full">
                <RefreshCw className={cn("w-4 h-4 mr-2", isSaving && "animate-spin")} />
                {habits.length === 0 ? 'Generate' : 'Refresh'}
              </Button>
            </div>
            
            {/* Refresh Confirmation Dialog */}
            <AlertDialog open={showRefreshConfirm} onOpenChange={setShowRefreshConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Refresh habits?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will replace all your current habits for today with new ones. Your progress on completed habits will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Current</AlertDialogCancel>
                  <AlertDialogAction onClick={generateDailyHabits}>Generate New</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {isLoading ? (
              <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : habits.length === 0 ? (
              <div className="happify-card text-center py-8">
                <p className="text-muted-foreground mb-4">No habits for today yet</p>
                <Button onClick={generateDailyHabits} disabled={isSaving || !user}>
                  Generate Daily Habits
                </Button>
                {!user && <p className="text-xs text-muted-foreground mt-2">Sign in to save habits</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {habits.map((habit) => (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id, habit.completed)}
                    className={cn(
                      "happify-card p-4 w-full text-left flex items-center gap-4 transition-all",
                      habit.completed && "bg-happify-sage-light/50"
                    )}
                  >
                    <span className="text-2xl">{getHabitEmoji(habit.habit_type)}</span>
                    <div className="flex-1">
                      <p className={cn("font-medium", habit.completed && "line-through text-muted-foreground")}>
                        {habit.description}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{habit.habit_type}</p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      habit.completed ? "bg-happify-sage border-happify-sage text-white" : "border-border"
                    )}>
                      {habit.completed && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Custom Habit */}
            {user && (
              <div className="happify-card mt-6">
                <h4 className="font-medium mb-3">Add Custom Habit</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {habitCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCustomHabitType(cat.id)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm transition-all",
                        customHabitType === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Your custom habit..."
                    value={customHabit}
                    onChange={(e) => setCustomHabit(e.target.value)}
                    className="happify-input"
                  />
                  <Button onClick={addCustomHabit} disabled={!customHabit.trim() || isSaving} className="rounded-xl">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gratitude */}
        {activeSection === 'gratitude' && (
          <div className="space-y-4">
            <div className="happify-card">
              <h3 className="font-display font-semibold mb-3">What are you grateful for today?</h3>
              <Textarea
                placeholder="I'm grateful for..."
                value={newGratitude}
                onChange={(e) => setNewGratitude(e.target.value)}
                className="happify-input min-h-[100px] mb-3"
              />
              <Button onClick={saveGratitude} disabled={isSaving || !newGratitude.trim()} className="w-full rounded-xl">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
                Save Gratitude
              </Button>
            </div>

            {gratitudeEntries.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm text-muted-foreground">Your gratitude moments</h4>
                {gratitudeEntries.map((entry) => (
                  <div key={entry.id} className="p-3 rounded-xl bg-happify-warm-light/30 border border-happify-warm/20">
                    <p className="text-sm">{entry.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(entry.created_at), 'MMM d')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meditation Scripts */}
        {activeSection === 'meditation' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Simple scripts to guide your practice</p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 pb-2">
              {meditationCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedMeditationCategory(cat.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    selectedMeditationCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {filteredMeditations.map((script, i) => (
              <div key={i} className="happify-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold">{script.title}</h3>
                  <span className="text-xs bg-happify-lavender-light px-2 py-1 rounded-full">{script.duration}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{script.script}</p>
              </div>
            ))}
          </div>
        )}

        {/* Breathing Exercise */}
        {activeSection === 'breathing' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-muted-foreground">Follow the circle and breathe</p>
            </div>
            <div className="happify-card">
              <BreathingExercise />
            </div>
          </div>
        )}

        {/* Silence Challenge */}
        {activeSection === 'silence' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-display font-semibold text-xl mb-2">1-Minute Silence Challenge</h3>
              <p className="text-muted-foreground">Can you sit in complete stillness?</p>
            </div>
            <div className="happify-card">
              <SilenceChallenge />
            </div>
          </div>
        )}

        {/* Digital Detox */}
        {activeSection === 'detox' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Pick one challenge to try today</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {detoxChallenges.map((challenge, i) => (
                <div key={i} className="happify-card p-4 flex items-start gap-4 hover:shadow-soft transition-all">
                  <span className="text-2xl">{challenge.emoji}</span>
                  <div>
                    <h4 className="font-medium">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground">{challenge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}