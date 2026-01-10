-- Supabase Database Setup for WageWise
-- Run this in Supabase Dashboard → SQL Editor → New Query

-- 1. Add the date column (as TEXT to match app's "YYYY-MM-DD" string format)
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS date text NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM-DD');

-- 2. Enable Row Level Security (if not already enabled)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policy so users can only see/edit their own transactions
-- (Drop existing policy if it exists, then create new one)
DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.transactions;

CREATE POLICY "Users can manage their own transactions"
ON public.transactions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Verify the table structure (optional - just to check)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'transactions'
-- ORDER BY ordinal_position;

