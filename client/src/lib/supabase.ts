import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlayfdbhjwhodpvruohc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYXlmZGJoandob2RwdnJ1b2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTg4MDUsImV4cCI6MjA2NTU5NDgwNX0.DuDwvruX0Aasj3YbTXvbPxdsKUJX9ppQF243AdfvdyU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);