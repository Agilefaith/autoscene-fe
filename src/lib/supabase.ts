import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseUrl = rawUrl.startsWith('https://') || rawUrl.startsWith('http://')
  ? rawUrl
  : 'https://placeholder.supabase.co';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Always returns a fresh access token — use this before any backend API call. */
export async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? '';
}
