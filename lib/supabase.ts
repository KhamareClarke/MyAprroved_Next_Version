import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Hardcoded Supabase configuration
const supabaseUrl = "https://jismdkfjkngwbpddhomx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A";

// For client-side usage
export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

// For server-side usage in API routes
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Don't persist session on server-side
    },
    global: {
      headers: {
        "X-Client-Info": "myapproved-trades-platform",
      },
    },
  });
}
