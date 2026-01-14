import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, Sparkles, Smartphone, Wind, Check, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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

const meditationScripts = [
  {
    title: "1-Minute Breathing",
    duration: "1 min",
    script: "Close your eyes. Breathe in slowly for 4 counts... Hold for 4... Exhale for 6... Feel your shoulders drop. Repeat 3 times. You are exactly where you need to be."
  },
  {
    title: "Body Scan",
    duration: "2 min",
    script: "Start at the top of your head. Notice any tension. Let it soften. Move to your forehead... your jaw... your shoulders... your chest... your belly... your legs... your feet. With each breath, let go a little more."
  },
  {
    title: "Grounding",
    duration: "1 min",
    script: "Name 5 things you can see. 4 things you can touch. 3 things you can hear. 2 things you can smell. 1 thing you can taste. You are here. You are safe. You are present."
  }
];

const detoxChallenges = [
  { title: "Phone-free breakfast", desc: "Eat your first meal without looking at your phone" },
  { title: "No phone in bedroom", desc: "Charge your phone outside your bedroom tonight" },
  { title: "1-hour digital sunset", desc: "Stop screens 1 hour before bed" },
  { title: "Walk without podcasts", desc: "Take a 10-minute walk in silence" },
  { title: "App timeout", desc: "Set a 30-min daily limit on your most-used social app" }
];

const defaultHabits = {
  body: ["Take 3 deep breaths right now", "Drink a full glass of water", "Stretch for 2 minutes", "Go outside for 5 minutes", "Do 10 jumping jacks"],
  mind: ["Write down 1 thing you're grateful for", "Reframe a negative thought positively", "Say an affirmation out loud", "Compliment yourself sincerely", "Let go of 1 small worry"],
  digital: ["Put phone face-down for 30 min", "Unfollow 1 account that doesn't serve you", "Turn off non-essential notifications", "Use grayscale mode for 1 hour", "Delete 1 unused app"]
};

export default function Tools() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState<'habits' | 'gratitude' | 'meditation' | 'detox'>('habits');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [newGratitude, setNewGratitude] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    
    const [habitsRes, gratitudeRes] = await Promise.all([
      supabase.from('happiness_habits').select('*').eq('user_id', user.id).eq('date', today),
      supabase.from('gratitude_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    ]);
    
    if (habitsRes.data) setHabits(habitsRes.data);
    if (gratitudeRes.data) setGratitudeEntries(gratitudeRes.data);
    setIsLoading(false);
  };

  const generateDailyHabits = async () => {
    if (!user) {
      toast({ title: "Sign in to save habits", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Delete existing habits for today first
    await supabase.from('happiness_habits').delete().eq('user_id', user.id).eq('date', today);
    
    const newHabits = [
      { habit_type: 'body', description: defaultHabits.body[Math.floor(Math.random() * defaultHabits.body.length)] },
      { habit_type: 'mind', description: defaultHabits.mind[Math.floor(Math.random() * defaultHabits.mind.length)] },
      { habit_type: 'digital', description: defaultHabits.digital[Math.floor(Math.random() * defaultHabits.digital.length)] }
    ];

    const { error } = await supabase.from('happiness_habits').insert(
      newHabits.map(h => ({ ...h, user_id: user.id, date: today }))
    );

    if (error) {
      toast({ title: "Error generating habits", variant: "destructive" });
    } else {
      toast({ title: "New habits generated! 🌱" });
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
    { id: 'detox', label: 'Digital Detox', icon: Smartphone },
  ];

  const getHabitIcon = (type: string) => {
    switch (type) {
      case 'body': return '🧘';
      case 'mind': return '🧠';
      case 'digital': return '📱';
      default: return '✨';
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">Happiness Tools</h1>
          <p className="text-muted-foreground">Small practices for a lighter day</p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Today's Habits</h3>
              <Button size="sm" variant="outline" onClick={generateDailyHabits} disabled={isSaving} className="rounded-full">
                <RefreshCw className={cn("w-4 h-4 mr-2", isSaving && "animate-spin")} />
                {habits.length === 0 ? 'Generate' : 'Refresh'}
              </Button>
            </div>

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
                    <span className="text-2xl">{getHabitIcon(habit.habit_type)}</span>
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

        {/* Meditation */}
        {activeSection === 'meditation' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Simple scripts to guide your practice</p>
            {meditationScripts.map((script, i) => (
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

        {/* Digital Detox */}
        {activeSection === 'detox' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Pick one challenge to try today</p>
            {detoxChallenges.map((challenge, i) => (
              <div key={i} className="happify-card p-4 flex items-start gap-4">
                <span className="text-2xl">📵</span>
                <div>
                  <h4 className="font-medium">{challenge.title}</h4>
                  <p className="text-sm text-muted-foreground">{challenge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
