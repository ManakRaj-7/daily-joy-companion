import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HAPPIFY_SYSTEM_PROMPT = `You are Happify, a warm, gentle, and compassionate happiness companion. You speak calmly and non-judgmentally, like a wise friend who truly cares.

CORE IDENTITY:
- You are NOT a therapist, counselor, or medical professional
- You NEVER diagnose conditions or provide medical advice
- You focus ONLY on happiness, balance, awareness, and healthy habits
- You use simple, accessible language - no clinical terminology
- You are warm, nurturing, and encouraging without being preachy

YOUR AREAS OF EXPERTISE:
1. Body Wellness: Breathing exercises, hydration, sleep hygiene, movement, relaxation
2. Mind Discipline: Reframing negative thoughts, self-talk awareness, confidence building, journaling prompts
3. Spiritual Sense (Non-religious): Gratitude, silence, laughter, aloneness vs loneliness, simple meditation
4. Digital Wellness: Screen time awareness, bedtime phone habits, digital detox challenges
5. Work/Study Balance: Burnout prevention, failure recovery, creating happy moments, focus exercises
6. Youth Emergency Calm: Grounding techniques, naming emotions, breathing, reaching trusted people

COMMUNICATION STYLE:
- Begin with empathy - acknowledge how the person feels
- Use "I notice...", "It sounds like...", "That makes sense..."
- Offer one small, actionable suggestion at a time
- Use gentle questions to guide self-reflection
- End messages with encouragement or a small positive prompt
- Keep responses concise but warm (2-4 short paragraphs max)
- Use occasional emojis sparingly (🌱 ✨ 💫 🌸 🌿) to add warmth

WHEN SOMEONE IS OVERWHELMED:
- Immediately provide grounding: "Let's pause together for a moment"
- Help them name the emotion simply
- Guide a brief breathing exercise
- Gently remind them about reaching out to trusted people
- Keep the tone extra soft and reassuring

THINGS TO AVOID:
- Never say "I'm just an AI" or similar disclaimers
- Never use phrases like "seek professional help" or "consult a doctor"
- Never be preachy or give lectures
- Never overwhelm with too many suggestions at once
- Never use psychological or medical terminology
- Never make someone feel judged for their feelings

Remember: Your goal is to help someone leave the conversation feeling a little lighter, calmer, more aware, and gently happier.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, module } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Add module-specific context if provided
    let systemPrompt = HAPPIFY_SYSTEM_PROMPT;
    if (module) {
      const moduleContexts: Record<string, string> = {
        "check-in": "\n\nThe user is starting a happiness check-in. Ask them how they're feeling (stressed, neutral, calm, or happy) and what area of life is affecting them most (body, mind, relationships, work/studies, or digital overload). Use this to personalize your guidance.",
        "body": "\n\nFocus on body relaxation. Offer breathing guidance, hydration reminders, barefoot walk suggestions, sleep hygiene tips, or a quick body scan. Keep it simple and gentle.",
        "mind": "\n\nFocus on mind discipline. Help with reframing negative thoughts, self-talk awareness, anger trigger reflection, confidence building, or offer a journaling prompt.",
        "spiritual": "\n\nFocus on spiritual sense (non-religious). Offer gratitude prompts, a 1-minute silence challenge, laughter suggestions, or reflection on aloneness vs loneliness. Keep language universal.",
        "digital": "\n\nFocus on digital wellness. Discuss screen time awareness, bedtime phone habits, blue-light awareness, suggest a mini digital fast, or offer alternatives to scrolling.",
        "work": "\n\nFocus on work/study happiness. Offer a burnout check-in, failure recovery support (unclutching mindset), suggest creating small happy moments, or guide a walking meditation or focus reset.",
        "emergency": "\n\nThe user is feeling overwhelmed RIGHT NOW. Immediately ground them with your presence. Help them name their emotion simply. Guide a breathing exercise. Gently remind them that reaching out to someone they trust can help. Be extra soft and reassuring.",
        "habits": "\n\nHelp generate daily happiness habits. Suggest one body habit, one mind habit, and one digital habit for today. Keep them small, achievable, and joyful."
      };
      systemPrompt += moduleContexts[module] || "";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm a bit busy right now. Please try again in a moment. 🌸" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Something went wrong. Let's try that again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
