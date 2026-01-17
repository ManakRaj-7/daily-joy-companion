-- Create kindness challenges table to track completed challenges
CREATE TABLE public.kindness_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_title TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kindness_challenges ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own kindness challenges" 
ON public.kindness_challenges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own kindness challenges" 
ON public.kindness_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kindness challenges" 
ON public.kindness_challenges 
FOR DELETE 
USING (auth.uid() = user_id);