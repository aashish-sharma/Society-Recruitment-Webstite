"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function fetchSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) setUser(user);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (mounted) {
          let mergedProfile = profileData as Profile | null;
          if (mergedProfile) {
            const meta = user.user_metadata || {};
            const branch = mergedProfile.branch || meta.branch || null;
            const year = mergedProfile.year || meta.year || null;
            const fullName = mergedProfile.full_name || meta.full_name || null;

            if ((!mergedProfile.branch && meta.branch) || (!mergedProfile.year && meta.year)) {
              supabase.from("profiles").update({ branch, year }).eq("id", user.id).then();
            }

            mergedProfile = {
              ...mergedProfile,
              branch,
              year,
              full_name: fullName,
            };
          }
          setProfile(mergedProfile);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    }

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setUser(session.user);
        setLoading(true); // Re-fetch profile on auth change
      }
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (mounted) {
        let mergedProfile = profileData as Profile | null;
        if (mergedProfile) {
          const meta = session.user.user_metadata || {};
          const branch = mergedProfile.branch || meta.branch || null;
          const year = mergedProfile.year || meta.year || null;
          const fullName = mergedProfile.full_name || meta.full_name || null;

          if ((!mergedProfile.branch && meta.branch) || (!mergedProfile.year && meta.year)) {
            supabase.from("profiles").update({ branch, year }).eq("id", session.user.id).then();
          }

          mergedProfile = {
            ...mergedProfile,
            branch,
            year,
            full_name: fullName,
          };
        }
        setProfile(mergedProfile);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}
