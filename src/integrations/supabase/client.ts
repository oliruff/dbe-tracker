// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gdimgbbrchplbsmnzheg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaW1nYmJyY2hwbGJzbW56aGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTE1MjQsImV4cCI6MjA1NDE4NzUyNH0.7wqCK33-T6-HNCDeQ92ctrQYx40Hh56xP_EZ70UqN-0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);