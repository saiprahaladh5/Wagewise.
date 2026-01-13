// app/lib/supabaseServer.ts
// Server-side Supabase client for API routes
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

// Get user from request (reads auth from cookies)
export async function getServerUser(req?: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  const cookieStore = await cookies();
  
  // Create a Supabase client that can read cookies
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        if (req) {
          // Try to get from request cookies first
          return req.cookies.get(name)?.value;
        }
        return cookieStore.get(name)?.value;
      },
      set() {
        // No-op in server context (cookies are set by client)
      },
      remove() {
        // No-op in server context (cookies are removed by client)
      },
    },
  });
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}
