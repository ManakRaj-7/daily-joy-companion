import { useState, useEffect } from 'react';
import { getDailyAffirmation, getRandomAffirmation } from '@/data/affirmations';
import { RefreshCw, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function DailyAffirmation() {
  const [affirmation, setAffirmation] = useState(getDailyAffirmation());
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const refreshAffirmation = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setAffirmation(getRandomAffirmation());
      setIsAnimating(false);
    }, 300);
  };

  const shareAffirmation = async () => {
    const text = `"${affirmation.text}" ✨ — via Happify`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard! 📋" });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-happify-lavender-light/50 to-happify-warm-light/30 p-6 md:p-8">
      <div className="absolute top-4 right-4 opacity-10">
        <Sparkles className="w-24 h-24" />
      </div>
      
      <div className="relative">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Today's Affirmation</span>
        </div>
        
        <p 
          className={`font-display text-xl md:text-2xl font-medium leading-relaxed mb-6 transition-all duration-300 ${
            isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          "{affirmation.text}"
        </p>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshAffirmation}
            className="rounded-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnimating ? 'animate-spin' : ''}`} />
            New Quote
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={shareAffirmation}
            className="rounded-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
