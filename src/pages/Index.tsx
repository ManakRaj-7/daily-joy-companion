import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { MessageCircle, Heart, Sparkles, Leaf, Moon, Smartphone } from 'lucide-react';

const features = [
  { icon: Heart, title: 'Body Wellness', desc: 'Breathing, relaxation, sleep' },
  { icon: Sparkles, title: 'Mind Clarity', desc: 'Reframe thoughts, build confidence' },
  { icon: Leaf, title: 'Inner Peace', desc: 'Gratitude, silence, presence' },
  { icon: Smartphone, title: 'Digital Balance', desc: 'Healthy screen habits' },
  { icon: Moon, title: 'Work Harmony', desc: 'Prevent burnout, find joy' },
  { icon: MessageCircle, title: 'Always Here', desc: 'Talk anytime, judgment-free' },
];

export default function Index() {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative px-4 pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 happify-gradient-sunrise opacity-30" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-happify-coral/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-happify-sage/20 rounded-full blur-3xl animate-float" />
          
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Your daily happiness companion
            </div>
            
            <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 animate-slide-up">
              Happiness is a{' '}
              <span className="bg-gradient-to-r from-primary via-happify-coral to-happify-warm bg-clip-text text-transparent">
                daily practice
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              A gentle companion for your body, mind, and spirit. 
              No judgment, no pressure — just warmth and awareness.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/chat">
                <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-glow">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Chatting
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-bold text-3xl text-center mb-12">
              How Happify helps you
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <div 
                  key={title}
                  className="happify-card text-center hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">Ready to feel a little lighter?</p>
          <Link to="/chat">
            <Button size="lg" className="rounded-full px-10">
              Begin Your Journey 🌸
            </Button>
          </Link>
        </section>
      </div>
    </Layout>
  );
}
