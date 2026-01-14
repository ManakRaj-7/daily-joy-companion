import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = { role: 'user' | 'assistant'; content: string };

const modules = [
  { id: 'check-in', label: '💫 Check-In', color: 'bg-happify-warm/20' },
  { id: 'body', label: '🧘 Body', color: 'bg-happify-sage/20' },
  { id: 'mind', label: '🧠 Mind', color: 'bg-happify-lavender/20' },
  { id: 'digital', label: '📱 Digital', color: 'bg-happify-sky/20' },
  { id: 'emergency', label: '🆘 Calm Me', color: 'bg-destructive/10' },
];

export default function Chat() {
  const { user, isGuest } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string, module?: string) => {
    if (!text.trim() && !module) return;
    
    const userMessage: Message = { role: 'user', content: text || `Starting ${module} mode` };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    if (module) setCurrentModule(module);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/happiness-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages, module: module || currentModule }),
      });

      if (!resp.ok || !resp.body) throw new Error('Failed to get response');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: assistantContent }]);
            }
          } catch {}
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a moment. Could you try again? 🌸" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex flex-col max-w-3xl mx-auto">
        {/* Guest Banner */}
        {isGuest && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-muted flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Guest mode — your chats won't be saved
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <span className="text-6xl mb-4">🌸</span>
              <h2 className="font-display font-bold text-2xl mb-2">Hi there, friend</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                I'm here to support your happiness. Pick a topic or just say hello.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {modules.map(({ id, label, color }) => (
                  <button
                    key={id}
                    onClick={() => sendMessage(`Let's work on my ${id}`, id)}
                    className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105", color)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-md' 
                    : 'bg-muted rounded-bl-md'
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-background">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share what's on your mind..."
              className="happify-input flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="rounded-xl px-4">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
