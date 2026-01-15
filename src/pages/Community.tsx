import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, Send, Loader2, Sparkles, Star } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { kindnessChallenges, communityPrompts } from '@/data/kindnessChallenges';

type CommunityMessage = {
  id: string;
  content: string;
  likes: number;
  created_at: string;
};

const reactions = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🙏', label: 'Grateful' },
  { emoji: '✨', label: 'Inspiring' },
  { emoji: '🤗', label: 'Warm' },
];

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'wall' | 'challenges'>('wall');
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentPrompt] = useState(communityPrompts[Math.floor(Math.random() * communityPrompts.length)]);
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [reactedMessages, setReactedMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setMessages(data);
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    if (!user) {
      toast({ title: "Sign in to share", description: "Create an account to post messages", variant: "destructive" });
      return;
    }

    setIsSending(true);
    const { error } = await supabase.from('community_messages').insert({
      content: newMessage.trim()
    });

    if (error) {
      toast({ title: "Couldn't send", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Shared with love 💕" });
      setNewMessage('');
      fetchMessages();
    }
    setIsSending(false);
  };

  const reactToMessage = (id: string, currentLikes: number) => {
    // Prevent multiple reactions to same message
    if (reactedMessages.has(id)) return;
    
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === id ? { ...m, likes: currentLikes + 1 } : m));
    setReactedMessages(prev => new Set([...prev, id]));
  };

  const todaysChallenge = kindnessChallenges[new Date().getDate() % kindnessChallenges.length];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">Community</h1>
          <p className="text-muted-foreground">Share kindness, spread joy</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('wall')}
            className={cn(
              "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
              activeTab === 'wall' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Heart className="w-4 h-4" /> Gratitude Wall
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={cn(
              "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
              activeTab === 'challenges' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Sparkles className="w-4 h-4" /> Kindness Challenges
          </button>
        </div>

        {activeTab === 'wall' ? (
          <>
            {/* Post New Message */}
            <div className="happify-card mb-8">
              <p className="text-sm text-muted-foreground mb-3 italic">💭 {currentPrompt}</p>
              <Textarea
                placeholder="Share something positive..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="happify-input min-h-[100px] mb-3"
                maxLength={280}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{newMessage.length}/280</span>
                <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()} className="rounded-full">
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Share
                </Button>
              </div>
              {!user && (
                <p className="text-xs text-muted-foreground mt-2 text-center">Sign in to share with the community</p>
              )}
            </div>

            {/* Messages */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">🌸</span>
                <p className="text-muted-foreground">Be the first to share something kind!</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className="happify-card p-5 hover:shadow-soft transition-all duration-300"
                  >
                    <p className="text-foreground leading-relaxed mb-4">{message.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'MMM d')}
                      </span>
                      <div className="flex gap-1">
                        {reactions.map(r => (
                          <button
                            key={r.emoji}
                            onClick={() => reactToMessage(message.id, message.likes)}
                            disabled={reactedMessages.has(message.id)}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all",
                              reactedMessages.has(message.id)
                                ? "bg-happify-coral-light/30 text-happify-coral"
                                : "hover:bg-muted"
                            )}
                            title={r.label}
                          >
                            {r.emoji}
                          </button>
                        ))}
                        {message.likes > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">+{message.likes}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {/* Today's Challenge */}
            <div className="happify-card border-2 border-primary/20 bg-gradient-to-br from-happify-warm-light/50 to-happify-coral-light/30">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold">Today's Challenge</h3>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-3xl">{todaysChallenge.emoji}</span>
                <div>
                  <h4 className="font-medium text-lg">{todaysChallenge.title}</h4>
                  <p className="text-muted-foreground">{todaysChallenge.description}</p>
                </div>
              </div>
            </div>

            {/* All Challenges */}
            <div>
              <h3 className="font-display font-semibold mb-4">All Kindness Challenges</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {kindnessChallenges.map((challenge, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedChallenge(selectedChallenge === i ? null : i)}
                    className={cn(
                      "happify-card p-4 text-left transition-all",
                      selectedChallenge === i && "ring-2 ring-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{challenge.emoji}</span>
                      <div>
                        <h4 className="font-medium">{challenge.title}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        <span className={cn(
                          "inline-block mt-2 text-xs px-2 py-0.5 rounded-full",
                          challenge.difficulty === 'easy' && "bg-happify-sage-light text-happify-sage-dark",
                          challenge.difficulty === 'medium' && "bg-happify-warm-light text-happify-coral-dark",
                          challenge.difficulty === 'hard' && "bg-happify-lavender-light text-happify-lavender-dark"
                        )}>
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}