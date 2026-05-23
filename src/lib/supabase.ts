import { createClient } from '@supabase/supabase-js';

// Support both VITE_ and NEXT_PUBLIC_ prefixes for maximum flexibility
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://sphjjlsutwxywslhenyp.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaGpqbHN1dHd4eXdzbGhlbnlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MTI3ODUsImV4cCI6MjA5NTA4ODc4NX0.X2WUhePTayDhliuz1_wx3keEMGhfDqnaruj7UOf7W5M';

if (!SUPABASE_URL.startsWith('https://')) {
  console.warn('Supabase URL does not start with https://');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
