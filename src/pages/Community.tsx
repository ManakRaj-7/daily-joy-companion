import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type CommunityMessage = {
  id: string;
  content: string;
  likes: number;
  created_at: string;
};

const kindnessPrompts = [
  "Share a compliment you'd give to a stranger",
  "What small act of kindness made your day?",
  "Write an encouraging note to someone having a hard time",
  "What positive affirmation do you need today?",
  "Share something that made you smile recently"
];

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentPrompt] = useState(kindnessPrompts[Math.floor(Math.random() * kindnessPrompts.length)]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    
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

  const likeMessage = async (id: string, currentLikes: number) => {
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === id ? { ...m, likes: currentLikes + 1 } : m));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">Gratitude Wall</h1>
          <p className="text-muted-foreground">Anonymous kindness from the community</p>
        </div>

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
                  <button
                    onClick={() => likeMessage(message.id, message.likes)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-happify-coral transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    {message.likes > 0 && message.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
