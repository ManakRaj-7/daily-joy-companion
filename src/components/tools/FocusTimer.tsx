import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, Brain, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_CONFIGS = {
  focus: { duration: 25 * 60, label: 'Focus Time', icon: Brain, color: 'text-primary' },
  shortBreak: { duration: 5 * 60, label: 'Short Break', icon: Coffee, color: 'text-happify-sage' },
  longBreak: { duration: 15 * 60, label: 'Long Break', icon: Coffee, color: 'text-happify-lavender' },
};

export function FocusTimer() {
  const { toast } = useToast();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIGS.focus.duration);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const config = TIMER_CONFIGS[mode];

  const playSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a gentle three-tone notification
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + i * 0.15;
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialDecayTo && gainNode.gain.exponentialDecayTo(0.01, startTime + 0.4);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      playSound();
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, playSound]);

  const handleTimerComplete = () => {
    if (mode === 'focus') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      
      toast({
        title: "Focus session complete! 🎉",
        description: newSessions % 4 === 0 
          ? "Time for a long break — you earned it!" 
          : "Take a short break to recharge.",
      });

      // Auto-switch to break
      if (newSessions % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      toast({
        title: "Break's over!",
        description: "Ready for another focus session?",
      });
      switchMode('focus');
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_CONFIGS[newMode].duration);
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(config.duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((config.duration - timeLeft) / config.duration) * 100;
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2">
        {Object.entries(TIMER_CONFIGS).map(([key, value]) => (
          <button
            key={key}
            onClick={() => switchMode(key as TimerMode)}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all",
              mode === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {value.label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative flex items-center justify-center">
        <div className="relative w-64 h-64">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              className={cn("transition-all duration-1000", config.color)}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon className={cn("w-8 h-8 mb-2", config.color)} />
            <span className="font-display text-5xl font-bold tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-muted-foreground mt-1">{config.label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={resetTimer}
          className="rounded-full w-14 h-14"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button
          size="lg"
          onClick={toggleTimer}
          className={cn(
            "rounded-full w-20 h-20 text-lg shadow-lg transition-all",
            isActive && "bg-happify-coral hover:bg-happify-coral/90"
          )}
        >
          {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </Button>
        <div className="w-14" /> {/* Spacer for symmetry */}
      </div>

      {/* Session Counter */}
      <div className="flex items-center justify-center gap-2">
        <CheckCircle className="w-4 h-4 text-happify-sage" />
        <span className="text-sm text-muted-foreground">
          {sessionsCompleted} focus {sessionsCompleted === 1 ? 'session' : 'sessions'} today
        </span>
      </div>

      {/* Quick Tips */}
      <div className="p-4 rounded-2xl bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">
          {mode === 'focus' 
            ? "💡 Stay focused! Avoid distractions until the timer ends."
            : "🧘 Stretch, hydrate, or rest your eyes during breaks."
          }
        </p>
      </div>
    </div>
  );
}
