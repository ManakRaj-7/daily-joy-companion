import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Leaf, Smartphone, Sparkles, MessageCircle } from 'lucide-react';

const pillars = [
  {
    icon: Heart,
    title: "Body",
    description: "Your body carries you through life. We help you listen to it — through breathing, movement, rest, and simple care rituals.",
    color: "bg-happify-coral/10 text-happify-coral-dark"
  },
  {
    icon: Brain,
    title: "Mind",
    description: "Your thoughts shape your reality. We help you notice patterns, reframe negativity, and build a kinder inner voice.",
    color: "bg-happify-lavender/20 text-happify-lavender-dark"
  },
  {
    icon: Leaf,
    title: "Inner Peace",
    description: "Beyond the noise, there's stillness. We help you find it through gratitude, silence, and simple moments of presence.",
    color: "bg-happify-sage/20 text-happify-sage-dark"
  },
  {
    icon: Smartphone,
    title: "Digital Balance",
    description: "Technology is a tool, not a master. We help you build healthier screen habits without guilt or judgment.",
    color: "bg-happify-sky/20 text-happify-sky"
  }
];

const principles = [
  "We don't diagnose. We listen.",
  "We don't preach. We suggest.",
  "We don't rush. We breathe with you.",
  "We don't judge. We understand.",
  "We don't fix. We support."
];

export default function About() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="text-6xl mb-6 block">🌸</span>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            About Happify
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Happiness isn't a destination. It's a daily practice — small moments of awareness, care, and presence.
          </p>
        </div>

        {/* Philosophy */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-2xl mb-6 text-center">Our Philosophy</h2>
          <div className="happify-card p-8 text-center">
            <p className="text-lg leading-relaxed text-muted-foreground">
              We believe happiness isn't about constant positivity. It's about <strong className="text-foreground">awareness</strong> — noticing how you feel, accepting it without judgment, and taking tiny steps toward balance.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mt-4">
              Happify is your gentle companion on this journey. Not a therapist. Not a coach. Just a <strong className="text-foreground">friend who reminds you to breathe</strong>.
            </p>
          </div>
        </section>

        {/* Four Pillars */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-2xl mb-6 text-center">The Four Pillars</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pillars.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="happify-card p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${color} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Approach */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-2xl mb-6 text-center">Our Approach</h2>
          <div className="space-y-3">
            {principles.map((principle, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
              >
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <p className="font-medium">{principle}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What We're Not */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-2xl mb-6 text-center">What We're Not</h2>
          <div className="happify-card p-8 bg-muted/30">
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Not a crisis line.</strong> If you're in danger, please reach out to emergency services.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Not a therapist.</strong> We don't provide medical or psychological treatment.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Not a quick fix.</strong> Happiness is built day by day, moment by moment.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-muted-foreground mb-6">
            Ready to start your daily happiness practice?
          </p>
          <Link to="/chat">
            <Button size="lg" className="rounded-full px-8">
              <MessageCircle className="w-5 h-5 mr-2" />
              Start a Conversation
            </Button>
          </Link>
        </section>
      </div>
    </Layout>
  );
}
