import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const durations = [
  { label: '1 min', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
];

export function SilenceChallenge() {
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setIsComplete(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((selectedDuration - timeLeft) / selectedDuration) * 100;

  const start = () => {
    setIsActive(true);
    setIsComplete(false);
  };

  const pause = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    setIsActive(false);
    setIsComplete(false);
    setTimeLeft(selectedDuration);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const selectDuration = (seconds: number) => {
    setSelectedDuration(seconds);
    setTimeLeft(seconds);
    setIsActive(false);
    setIsComplete(false);
  };

  return (
    <div className="space-y-6">
      {/* Duration Selection */}
      <div className="flex flex-wrap justify-center gap-2">
        {durations.map((d) => (
          <button
            key={d.seconds}
            onClick={() => selectDuration(d.seconds)}
            disabled={isActive}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedDuration === d.seconds
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative flex justify-center py-8">
        <div className="relative w-56 h-56">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="100"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="112"
              cy="112"
              r="100"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={628}
              strokeDashoffset={628 - (628 * progress) / 100}
              className="transition-all duration-1000"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isComplete ? (
              <div className="text-center">
                <span className="text-4xl block mb-2">🧘</span>
                <p className="font-display font-bold text-xl text-primary">Well done!</p>
                <p className="text-sm text-muted-foreground">You found stillness</p>
              </div>
            ) : (
              <>
                <Volume2 className={cn(
                  "w-8 h-8 mb-2 transition-opacity",
                  isActive ? "text-primary animate-pulse" : "text-muted-foreground"
                )} />
                <span className="text-4xl font-display font-bold">{formatTime(timeLeft)}</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {isActive ? "Embrace the silence" : "Ready?"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!isActive && !isComplete && (
        <div className="text-center text-sm text-muted-foreground max-w-md mx-auto">
          <p>Find a quiet spot. Close your eyes. Let thoughts come and go without holding onto them. Just be.</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!isActive ? (
          <Button onClick={start} className="rounded-full px-8">
            <Play className="w-4 h-4 mr-2" />
            {isComplete ? 'Try Again' : 'Begin'}
          </Button>
        ) : (
          <Button onClick={pause} variant="outline" className="rounded-full px-8">
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}
        <Button onClick={reset} variant="ghost" className="rounded-full">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}