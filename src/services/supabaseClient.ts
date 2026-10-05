import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cấu hình URL và Publishable/Anon Key từ biến môi trường hoặc cấu hình của Cô Nhung
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://ymnxuxrkozepniwxnlkp.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_66IeMrT_XTQ4emvvEndcYg_vhao8tXK';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('your-project') &&
    !SUPABASE_ANON_KEY.includes('your-anon-key')
);

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
