import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Prefer environment variables (Vite exposes VITE_* at build time). If absent,
// fall back to the URL/key provided by the user in the request.
const DEFAULT_URL = "https://jkyvdphpzoakbtpmffuz.supabase.co";
const DEFAULT_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpreXZkcGhwem9ha2J0cG1mZnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTI1NDIsImV4cCI6MjA3ODY4ODU0Mn0.2zUP0SWht1QYhUULh_XQG5oDgOYH8XsdYyGMbirYvcQ";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_URL;
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_KEY as string) || DEFAULT_KEY;

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (_supabase) return _supabase;
  _supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
  return _supabase;
}

export default getSupabaseClient();
