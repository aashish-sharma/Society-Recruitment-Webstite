import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

/**
 * Server-side helper to get the current authenticated user and their profile.
 * Expects a server client created by `createServerClient`.
 */
export async function getProfile(supabase: SupabaseClient): Promise<Profile | null> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  const meta = user.user_metadata || {};
  const branch = profile.branch || meta.branch || null;
  const year = profile.year || meta.year || null;
  const fullName = profile.full_name || meta.full_name || null;

  // If profile is missing branch or year, but user_metadata has them, sync it back to profiles
  if (
    (!profile.branch && meta.branch) ||
    (!profile.year && meta.year) ||
    (!profile.full_name && meta.full_name)
  ) {
    await supabase
      .from("profiles")
      .update({
        branch: branch,
        year: year,
        full_name: fullName,
      })
      .eq("id", user.id);
  }

  return {
    ...profile,
    full_name: fullName,
    year: year,
    branch: branch,
  } as Profile;
}
