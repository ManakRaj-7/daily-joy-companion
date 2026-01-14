import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState<'student' | 'working' | 'other' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, continueAsGuest, user, isGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user || isGuest) {
      navigate('/chat');
    }
  }, [user, isGuest, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Couldn't sign in",
            description: error.message === 'Invalid login credentials' 
              ? "Email or password is incorrect. Please try again."
              : error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back! 🌸",
            description: "Great to see you again."
          });
          navigate('/chat');
        }
      } else {
        const { error } = await signUp(
          email, 
          password, 
          name || undefined, 
          age ? parseInt(age) : undefined, 
          role || undefined
        );
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Email already registered",
              description: "Try signing in instead, or use a different email.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Couldn't create account",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Welcome to Happify! 🌸",
            description: "Your happiness journey begins now."
          });
          navigate('/chat');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    toast({
      title: "Welcome, friend! 🌿",
      description: "You're browsing as a guest. Your chats won't be saved."
    });
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-4xl">🌸</span>
              <h1 className="font-display font-bold text-3xl bg-gradient-to-r from-primary to-happify-warm bg-clip-text text-transparent">
                Happify
              </h1>
            </div>
            <p className="text-muted-foreground">
              {mode === 'login' 
                ? 'Welcome back to your happiness practice' 
                : 'Begin your happiness journey'}
            </p>
          </div>

          {/* Guest Mode Button */}
          <button
            onClick={handleGuestMode}
            className="w-full py-4 px-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
          >
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-foreground">Continue as Guest</p>
                <p className="text-xs text-muted-foreground">Start chatting instantly — no account needed</p>
              </div>
            </div>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Auth Form */}
          <div className="happify-card">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode('login')}
                className={cn(
                  "flex-1 py-2 rounded-xl font-medium transition-all",
                  mode === 'login'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={cn(
                  "flex-1 py-2 rounded-xl font-medium transition-all",
                  mode === 'signup'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="How should we call you?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="happify-input"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={cn("happify-input", errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  className={cn("happify-input", errors.password && "border-destructive")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age (optional)</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Your age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="happify-input"
                        min="13"
                        max="120"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>I am a...</Label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="happify-input"
                      >
                        <option value="">Select</option>
                        <option value="student">Student</option>
                        <option value="working">Working</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl py-6 text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to nurture your happiness daily 🌱
          </p>
        </div>
      </div>
    </div>
  );
}
