"use client";

import { useAuth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase environment variables are missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url, anonKey };
}

export function useSupabaseClient() {
  const { getToken } = useAuth();
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
    accessToken: async () => (await getToken()) ?? null,
  });
}
