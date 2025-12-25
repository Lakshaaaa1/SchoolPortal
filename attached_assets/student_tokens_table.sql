-- Student tokens table for push notifications
CREATE TABLE IF NOT EXISTS public.student_tokens (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR NOT NULL,
    class VARCHAR NOT NULL,
    section VARCHAR,
    fcm_token TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_tokens_student_id ON public.student_tokens(student_id);
CREATE INDEX IF NOT EXISTS idx_student_tokens_fcm_token ON public.student_tokens(fcm_token);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_student_tokens_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_student_tokens_updated_at ON public.student_tokens;
CREATE TRIGGER update_student_tokens_updated_at
    BEFORE UPDATE ON public.student_tokens
    FOR EACH ROW EXECUTE FUNCTION update_student_tokens_updated_at_column();

-- Enable RLS and allow anon access for now (adjust as needed)
ALTER TABLE public.student_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON public.student_tokens FOR ALL USING (true) WITH CHECK (true);
