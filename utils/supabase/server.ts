import { auth } from "@clerk/nextjs/server";
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

export function createSupabaseServerClient(accessToken: string) {
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
    accessToken: async () => accessToken,
  });
}

export async function createClerkSupabaseClientSsr() {
  const { getToken } = await auth();
  const accessToken = await getToken();

  if (!accessToken) {
    throw new Error(
      'Missing Clerk "supabase" JWT template. Configure it in Clerk so server routes can query Supabase with RLS.',
    );
  }

  return createSupabaseServerClient(accessToken);
}
