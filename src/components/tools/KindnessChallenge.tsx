import { useState, useEffect } from 'react';
import { kindnessChallenges } from '@/data/kindnessChallenges';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, RefreshCw, Heart, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type CompletedChallenge = {
  id: string;
  challenge_title: string;
  completed_at: string;
};

export function KindnessChallenge() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todayChallenge, setTodayChallenge] = useState(kindnessChallenges[0]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get consistent daily challenge based on date
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % kindnessChallenges.length;
    setTodayChallenge(kindnessChallenges[index]);
    
    if (user) {
      checkTodayCompletion();
      fetchCompletedCount();
    }
  }, [user]);

  const checkTodayCompletion = async () => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const { data } = await supabase
      .from('kindness_challenges')
      .select('id')
      .eq('user_id', user.id)
      .gte('completed_at', `${today}T00:00:00`)
      .lt('completed_at', `${today}T23:59:59`);
    
    setIsCompleted(data && data.length > 0);
  };

  const fetchCompletedCount = async () => {
    if (!user) return;
    
    const { count } = await supabase
      .from('kindness_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    setCompletedCount(count || 0);
  };

  const markComplete = async () => {
    if (!user) {
      toast({ title: "Sign in to track challenges", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await supabase.from('kindness_challenges').insert({
      user_id: user.id,
      challenge_title: todayChallenge.title
    });
    
    if (error) {
      toast({ title: "Couldn't save challenge", variant: "destructive" });
    } else {
      setIsCompleted(true);
      setCompletedCount(prev => prev + 1);
      toast({ title: "Kindness completed! 💕", description: "You're making the world brighter!" });
      
      // Play celebration sound
      playSuccessSound();
    }
    
    setIsLoading(false);
  };

  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + i * 0.1;
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialDecayTo && gainNode.gain.exponentialDecayTo(0.01, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  };

  const getRandomChallenge = () => {
    const randomIndex = Math.floor(Math.random() * kindnessChallenges.length);
    setTodayChallenge(kindnessChallenges[randomIndex]);
    setIsCompleted(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-happify-sage-light text-happify-sage';
      case 'medium': return 'bg-happify-warm-light text-happify-warm';
      case 'hard': return 'bg-happify-lavender-light text-happify-lavender';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-happify-coral-light/50 to-happify-warm-light/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-happify-coral" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-sm text-muted-foreground">Acts of kindness</p>
          </div>
        </div>
      </div>

      {/* Today's Challenge */}
      <div className={cn(
        "happify-card relative overflow-hidden transition-all",
        isCompleted && "bg-happify-sage-light/30 border-happify-sage/30"
      )}>
        {isCompleted && (
          <div className="absolute top-3 right-3">
            <div className="w-8 h-8 rounded-full bg-happify-sage flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-4">
          <span className="text-4xl">{todayChallenge.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-display font-semibold text-lg">{todayChallenge.title}</h3>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                getDifficultyColor(todayChallenge.difficulty)
              )}>
                {todayChallenge.difficulty}
              </span>
            </div>
            <p className="text-muted-foreground">{todayChallenge.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={markComplete} 
            disabled={isCompleted || isLoading}
            className="flex-1 rounded-xl"
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Completed!
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={getRandomChallenge}
            className="rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Challenge List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">More kindness ideas</h4>
        <div className="grid gap-2">
          {kindnessChallenges.slice(0, 5).map((challenge, i) => (
            <button
              key={i}
              onClick={() => {
                setTodayChallenge(challenge);
                setIsCompleted(false);
              }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-muted/50",
                todayChallenge.title === challenge.title && "bg-primary/10 border border-primary/20"
              )}
            >
              <span className="text-xl">{challenge.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{challenge.title}</p>
                <p className="text-xs text-muted-foreground truncate">{challenge.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
