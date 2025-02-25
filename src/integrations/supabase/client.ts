
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kijrprhxixsvnyqljwaz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpanJwcmh4aXhzdm55cWxqd2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MTEyNzMsImV4cCI6MjA1NjA4NzI3M30.C74uYTKOIM1YP-A6CcGuo5HE-0mNE20HSdptTDngs0c";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
