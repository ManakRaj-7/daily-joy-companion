import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type BreathingPattern = {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter?: number;
  cycles: number;
  description: string;
};

const patterns: BreathingPattern[] = [
  { name: "4-7-8 Relaxing", inhale: 4, hold: 7, exhale: 8, cycles: 4, description: "Deep relaxation, helps with sleep" },
  { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4, holdAfter: 4, cycles: 4, description: "Balance & focus, used by Navy SEALs" },
  { name: "Calming Breath", inhale: 4, hold: 2, exhale: 6, cycles: 6, description: "Quick stress relief" },
  { name: "Energizing", inhale: 6, hold: 0, exhale: 2, cycles: 8, description: "Boost energy & alertness" },
];

export function BreathingExercise() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(patterns[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfter' | 'complete'>('inhale');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const getPhaseLabel = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'holdAfter': return 'Hold';
      case 'complete': return 'Complete! 🌸';
      default: return '';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return 'from-happify-sage to-happify-sky';
      case 'hold': return 'from-happify-lavender to-happify-coral';
      case 'exhale': return 'from-happify-coral to-happify-warm';
      case 'holdAfter': return 'from-happify-lavender to-happify-sage';
      case 'complete': return 'from-happify-sage to-happify-sage-light';
      default: return 'from-muted to-muted';
    }
  };

  const getCircleScale = () => {
    if (!isActive || phase === 'complete') return 1;
    const maxScale = 1.4;
    const minScale = 0.7;
    
    switch (phase) {
      case 'inhale':
        return minScale + (progress / 100) * (maxScale - minScale);
      case 'hold':
      case 'holdAfter':
        return phase === 'hold' ? maxScale : minScale;
      case 'exhale':
        return maxScale - (progress / 100) * (maxScale - minScale);
      default:
        return 1;
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const phaseDurations = {
      inhale: selectedPattern.inhale,
      hold: selectedPattern.hold,
      exhale: selectedPattern.exhale,
      holdAfter: selectedPattern.holdAfter || 0,
    };

    const currentDuration = phaseDurations[phase as keyof typeof phaseDurations] || 0;
    
    if (currentDuration === 0 && phase !== 'complete') {
      // Skip phases with 0 duration
      nextPhase();
      return;
    }

    setCountdown(currentDuration);
    setProgress(0);

    let elapsed = 0;
    intervalRef.current = window.setInterval(() => {
      elapsed += 0.1;
      const remaining = currentDuration - elapsed;
      setCountdown(Math.max(0, Math.ceil(remaining)));
      setProgress((elapsed / currentDuration) * 100);

      if (remaining <= 0) {
        nextPhase();
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, phase, selectedPattern]);

  const nextPhase = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    if (phase === 'inhale') {
      if (selectedPattern.hold > 0) setPhase('hold');
      else setPhase('exhale');
    } else if (phase === 'hold') {
      setPhase('exhale');
    } else if (phase === 'exhale') {
      if (selectedPattern.holdAfter && selectedPattern.holdAfter > 0) {
        setPhase('holdAfter');
      } else {
        completeCycle();
      }
    } else if (phase === 'holdAfter') {
      completeCycle();
    }
  };

  const completeCycle = () => {
    if (currentCycle >= selectedPattern.cycles) {
      setPhase('complete');
      setIsActive(false);
    } else {
      setCurrentCycle(c => c + 1);
      setPhase('inhale');
    }
  };

  const start = () => {
    setIsActive(true);
    setPhase('inhale');
    setCurrentCycle(1);
    setProgress(0);
  };

  const pause = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCurrentCycle(1);
    setCountdown(0);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className="space-y-6">
      {/* Pattern Selection */}
      <div className="flex flex-wrap gap-2">
        {patterns.map((pattern) => (
          <button
            key={pattern.name}
            onClick={() => {
              reset();
              setSelectedPattern(pattern);
            }}
            disabled={isActive}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm transition-all",
              selectedPattern.name === pattern.name
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {pattern.name}
          </button>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground text-center">{selectedPattern.description}</p>

      {/* Breathing Circle */}
      <div className="flex flex-col items-center py-8">
        <div 
          className={cn(
            "w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out bg-gradient-to-br",
            getPhaseColor()
          )}
          style={{ transform: `scale(${getCircleScale()})` }}
        >
          <div className="text-center text-white">
            <p className="text-2xl font-display font-bold">{getPhaseLabel()}</p>
            {isActive && phase !== 'complete' && (
              <p className="text-5xl font-bold mt-2">{countdown}</p>
            )}
          </div>
        </div>

        {/* Cycle indicator */}
        <div className="mt-6 flex gap-2">
          {Array.from({ length: selectedPattern.cycles }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                i < currentCycle ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Cycle {currentCycle} of {selectedPattern.cycles}
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!isActive ? (
          <Button onClick={start} className="rounded-full px-8">
            <Play className="w-4 h-4 mr-2" />
            {phase === 'complete' ? 'Start Again' : 'Start'}
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