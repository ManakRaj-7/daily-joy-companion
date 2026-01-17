export const affirmations = [
  { text: "You are exactly where you need to be right now.", category: "peace" },
  { text: "Your feelings are valid, and it's okay to feel them.", category: "self" },
  { text: "Small steps still move you forward.", category: "growth" },
  { text: "You deserve rest, not just productivity.", category: "self" },
  { text: "Today is a fresh page in your story.", category: "hope" },
  { text: "You are more resilient than you know.", category: "strength" },
  { text: "It's okay to take things one moment at a time.", category: "peace" },
  { text: "Your worth is not measured by your output.", category: "self" },
  { text: "Difficult days don't last forever.", category: "hope" },
  { text: "You bring something unique to this world.", category: "self" },
  { text: "Progress, not perfection, is what matters.", category: "growth" },
  { text: "You are allowed to set boundaries.", category: "strength" },
  { text: "Joy can be found in the smallest moments.", category: "peace" },
  { text: "Your past does not define your future.", category: "hope" },
  { text: "Being kind to yourself is not selfish.", category: "self" },
  { text: "You have survived 100% of your hardest days.", category: "strength" },
  { text: "Every breath is a chance to begin again.", category: "peace" },
  { text: "You are worthy of love and belonging.", category: "self" },
  { text: "Trust the timing of your life.", category: "hope" },
  { text: "You are growing, even when you can't see it.", category: "growth" },
  { text: "It's okay to ask for help.", category: "strength" },
  { text: "Your presence matters to someone.", category: "self" },
  { text: "Let go of what you cannot control.", category: "peace" },
  { text: "Good things are coming your way.", category: "hope" },
  { text: "You are capable of amazing things.", category: "growth" },
  { text: "Rest is productive. You need it.", category: "self" },
  { text: "This moment is all you need to focus on.", category: "peace" },
  { text: "Your struggles are shaping your strength.", category: "strength" },
  { text: "Tomorrow holds new possibilities.", category: "hope" },
  { text: "You are doing better than you think.", category: "growth" },
];

export const getRandomAffirmation = () => {
  return affirmations[Math.floor(Math.random() * affirmations.length)];
};

export const getDailyAffirmation = () => {
  // Use date as seed for consistent daily affirmation
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % affirmations.length;
  return affirmations[index];
};
