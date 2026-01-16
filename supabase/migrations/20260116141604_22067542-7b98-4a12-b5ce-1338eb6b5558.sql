-- Drop the old constraint and add new one that includes spiritual
ALTER TABLE public.happiness_habits DROP CONSTRAINT IF EXISTS happiness_habits_habit_type_check;
ALTER TABLE public.happiness_habits ADD CONSTRAINT happiness_habits_habit_type_check CHECK (habit_type IN ('body', 'mind', 'digital', 'spiritual'));