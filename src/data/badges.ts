export type Badge = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: number;
  type: 'streak' | 'total' | 'gratitude' | 'kindness';
  unlocked?: boolean;
  unlockedAt?: string;
};

export const badges: Badge[] = [
  // Streak badges
  { id: 'streak_3', name: 'Getting Started', description: 'Complete 3-day habit streak', emoji: '🌱', requirement: 3, type: 'streak' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Complete 7-day habit streak', emoji: '🔥', requirement: 7, type: 'streak' },
  { id: 'streak_14', name: 'Consistency King', description: 'Complete 14-day habit streak', emoji: '👑', requirement: 14, type: 'streak' },
  { id: 'streak_30', name: 'Monthly Master', description: 'Complete 30-day habit streak', emoji: '🏆', requirement: 30, type: 'streak' },
  { id: 'streak_60', name: 'Two Month Titan', description: 'Complete 60-day habit streak', emoji: '💎', requirement: 60, type: 'streak' },
  { id: 'streak_100', name: 'Centurion', description: 'Complete 100-day habit streak', emoji: '🌟', requirement: 100, type: 'streak' },
  
  // Total habits completed
  { id: 'total_10', name: 'First Steps', description: 'Complete 10 habits total', emoji: '👣', requirement: 10, type: 'total' },
  { id: 'total_50', name: 'Habit Builder', description: 'Complete 50 habits total', emoji: '🏗️', requirement: 50, type: 'total' },
  { id: 'total_100', name: 'Century Club', description: 'Complete 100 habits total', emoji: '💯', requirement: 100, type: 'total' },
  { id: 'total_500', name: 'Habit Hero', description: 'Complete 500 habits total', emoji: '🦸', requirement: 500, type: 'total' },
  
  // Gratitude badges
  { id: 'gratitude_5', name: 'Grateful Heart', description: 'Write 5 gratitude entries', emoji: '💕', requirement: 5, type: 'gratitude' },
  { id: 'gratitude_30', name: 'Thankful Soul', description: 'Write 30 gratitude entries', emoji: '🙏', requirement: 30, type: 'gratitude' },
  { id: 'gratitude_100', name: 'Gratitude Guru', description: 'Write 100 gratitude entries', emoji: '✨', requirement: 100, type: 'gratitude' },
  
  // Kindness badges
  { id: 'kindness_3', name: 'Kind Spirit', description: 'Complete 3 kindness challenges', emoji: '💝', requirement: 3, type: 'kindness' },
  { id: 'kindness_10', name: 'Kindness Champion', description: 'Complete 10 kindness challenges', emoji: '🌈', requirement: 10, type: 'kindness' },
  { id: 'kindness_30', name: 'Compassion Master', description: 'Complete 30 kindness challenges', emoji: '🕊️', requirement: 30, type: 'kindness' },
];

export const checkBadgeUnlock = (
  stats: { streak: number; totalHabits: number; gratitudeCount: number; kindnessCount: number },
  unlockedBadgeIds: string[]
): Badge | null => {
  for (const badge of badges) {
    if (unlockedBadgeIds.includes(badge.id)) continue;
    
    let value = 0;
    switch (badge.type) {
      case 'streak': value = stats.streak; break;
      case 'total': value = stats.totalHabits; break;
      case 'gratitude': value = stats.gratitudeCount; break;
      case 'kindness': value = stats.kindnessCount; break;
    }
    
    if (value >= badge.requirement) {
      return badge;
    }
  }
  return null;
};
