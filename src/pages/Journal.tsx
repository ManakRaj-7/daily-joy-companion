import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const moods = [
  { value: 'stressed', emoji: '😰', label: 'Stressed' },
  { value: 'anxious', emoji: '😟', label: 'Anxious' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'joyful', emoji: '🥰', label: 'Joyful' },
];

const areas = [
  { value: 'body', label: '🧘 Body' },
  { value: 'mind', label: '🧠 Mind' },
  { value: 'relationships', label: '💕 Relationships' },
  { value: 'work', label: '💼 Work/Studies' },
  { value: 'digital', label: '📱 Digital' },
];

type MoodEntry = {
  id: string;
  mood: string;
  affected_area: string | null;
  note: string | null;
  created_at: string;
};

type JournalEntry = {
  id: string;
  title: string | null;
  content: string;
  entry_type: string;
  created_at: string;
};

export default function Journal() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'mood' | 'journal'>('mood');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New entry form
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [note, setNote] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user && !isGuest) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchEntries();
    } else {
      setIsLoading(false);
    }
  }, [user, isGuest, navigate]);

  const fetchEntries = async () => {
    if (!user) return;
    
    try {
      const [moodRes, journalRes] = await Promise.all([
        supabase.from('mood_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
      ]);
      
      if (moodRes.data) setMoodEntries(moodRes.data);
      if (journalRes.data) setJournalEntries(journalRes.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMoodEntry = async () => {
    if (!selectedMood) {
      toast({ title: "Please select how you're feeling", variant: "destructive" });
      return;
    }
    
    if (!user) {
      toast({ title: "Sign in to save entries", description: "Guest mode doesn't save data", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from('mood_entries').insert({
      user_id: user.id,
      mood: selectedMood,
      affected_area: selectedArea || null,
      note: note || null
    });

    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mood logged! 🌸", description: "Keep tracking — awareness is growth." });
      setSelectedMood('');
      setSelectedArea('');
      setNote('');
      fetchEntries();
    }
    setIsSaving(false);
  };

  const saveJournalEntry = async () => {
    if (!journalContent.trim()) {
      toast({ title: "Write something first", variant: "destructive" });
      return;
    }
    
    if (!user) {
      toast({ title: "Sign in to save entries", description: "Guest mode doesn't save data", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      title: journalTitle || null,
      content: journalContent,
      entry_type: 'reflection'
    });

    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Entry saved! ✨", description: "Your thoughts are safe here." });
      setJournalTitle('');
      setJournalContent('');
      fetchEntries();
    }
    setIsSaving(false);
  };

  const deleteMoodEntry = async (id: string) => {
    const { error } = await supabase.from('mood_entries').delete().eq('id', id);
    if (!error) {
      setMoodEntries(prev => prev.filter(e => e.id !== id));
      toast({ title: "Entry removed" });
    }
  };

  const deleteJournalEntry = async (id: string) => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (!error) {
      setJournalEntries(prev => prev.filter(e => e.id !== id));
      toast({ title: "Entry removed" });
    }
  };

  const getMoodEmoji = (mood: string) => moods.find(m => m.value === mood)?.emoji || '😐';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">Your Journal</h1>
          <p className="text-muted-foreground">Track your mood and reflect on your journey</p>
        </div>

        {isGuest && (
          <div className="mb-6 p-4 rounded-xl bg-muted text-center">
            <p className="text-sm text-muted-foreground mb-2">Guest mode — entries won't be saved</p>
            <Button size="sm" variant="outline" onClick={() => navigate('/auth')}>
              Sign in to save
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('mood')}
            className={cn(
              "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
              activeTab === 'mood' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            😊 Mood Log
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={cn(
              "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
              activeTab === 'journal' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <BookOpen className="w-4 h-4" /> Journal
          </button>
        </div>

        {activeTab === 'mood' ? (
          <div className="space-y-6">
            {/* New Mood Entry */}
            <div className="happify-card">
              <h3 className="font-display font-semibold text-lg mb-4">How are you feeling right now?</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {moods.map(({ value, emoji, label }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedMood(value)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm transition-all",
                      selectedMood === value
                        ? "bg-primary text-primary-foreground scale-105"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>

              <p className="text-sm text-muted-foreground mb-2">What's affecting you most?</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {areas.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedArea(selectedArea === value ? '' : value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-all",
                      selectedArea === value
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <Textarea
                placeholder="Any thoughts to add? (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mb-4 happify-input min-h-[80px]"
              />

              <Button onClick={saveMoodEntry} disabled={isSaving || !selectedMood} className="w-full rounded-xl">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Log Mood
              </Button>
            </div>

            {/* Past Mood Entries */}
            {isLoading ? (
              <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
            ) : moodEntries.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-medium text-muted-foreground">Recent moods</h3>
                {moodEntries.map((entry) => (
                  <div key={entry.id} className="happify-card p-4 flex items-start gap-3 group">
                    <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{entry.mood}</span>
                        {entry.affected_area && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{entry.affected_area}</span>
                        )}
                      </div>
                      {entry.note && <p className="text-sm text-muted-foreground">{entry.note}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(entry.created_at), 'MMM d, h:mm a')}</p>
                    </div>
                    <button
                      onClick={() => deleteMoodEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : user && (
              <p className="text-center text-muted-foreground py-8">No mood entries yet. Start tracking! 🌱</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* New Journal Entry */}
            <div className="happify-card">
              <h3 className="font-display font-semibold text-lg mb-4">Write your thoughts</h3>
              
              <input
                type="text"
                placeholder="Title (optional)"
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                className="happify-input mb-3"
              />
              
              <Textarea
                placeholder="What's on your mind? Let it flow..."
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                className="mb-4 happify-input min-h-[150px]"
              />

              <Button onClick={saveJournalEntry} disabled={isSaving || !journalContent.trim()} className="w-full rounded-xl">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Save Entry
              </Button>
            </div>

            {/* Past Journal Entries */}
            {isLoading ? (
              <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
            ) : journalEntries.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-medium text-muted-foreground">Your reflections</h3>
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="happify-card p-4 group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {entry.title && <h4 className="font-medium mb-1">{entry.title}</h4>}
                        <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">{format(new Date(entry.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <button
                        onClick={() => deleteJournalEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : user && (
              <p className="text-center text-muted-foreground py-8">No journal entries yet. Start writing! ✍️</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
