import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  MessageCircle, 
  BookHeart, 
  Sparkles, 
  Users, 
  Info,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

const navLinks = [
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/journal', label: 'Journal', icon: BookHeart },
  { to: '/tools', label: 'Tools', icon: Sparkles },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/about', label: 'About', icon: Info },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isGuest, signOut, exitGuestMode } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    if (isGuest) {
      exitGuestMode();
    } else {
      await signOut();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-display font-bold text-xl text-foreground"
          >
            <span className="text-2xl">🌸</span>
            <span className="bg-gradient-to-r from-primary to-happify-warm bg-clip-text text-transparent">
              Happify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  location.pathname === to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {(user || isGuest) ? (
              <div className="flex items-center gap-3">
                {isGuest && (
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    Guest Mode
                  </span>
                )}
                {user && (
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user.email?.split('@')[0]}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isGuest ? 'Exit' : 'Sign Out'}
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="rounded-full">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg animate-slide-down">
          <div className="p-4 space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                  location.pathname === to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-border">
              {(user || isGuest) ? (
                <div className="space-y-2">
                  {isGuest && (
                    <p className="text-sm text-muted-foreground px-4">
                      Browsing as Guest
                    </p>
                  )}
                  {user && (
                    <p className="text-sm text-muted-foreground px-4">
                      {user.email}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <Button className="w-full rounded-xl">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
