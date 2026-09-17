import { createClient } from "@/lib/supabase/server";
import { HomeContent } from "@/components/ui/home-content";
import type { Society, Role, ProcessStep } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: dbSocieties, error } = await supabase
    .from("societies")
    .select(`
      *,
      roles:roles_open(*),
      process:recruitment_steps(*)
    `)
    .order('name');

  if (error) {
    console.error("Error fetching societies:", error);
  }

  // Map the Supabase rows to the Society interface
  const societies: Society[] = (dbSocieties || []).map((s: any) => ({
    id: s.id, // Depending on the type in frontend, usually string or number. Let's pass it as is.
    slug: s.slug,
    name: s.name,
    category: s.category,
    tagline: s.tagline,
    logoInitials: s.logo_initials,
    description: s.description,
    criteria: s.criteria,
    deadline: s.deadline,
    foundedYear: s.founded_year,
    memberCount: s.member_count,
    meetingCadence: s.meeting_cadence,
    roles: (s.roles || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description
    } as Role)),
    process: (s.process || [])
      .sort((a: any, b: any) => a.step_order - b.step_order)
      .map((p: any) => ({
        title: p.title,
        description: p.description
      } as ProcessStep))
  }));

  const categories = Array.from(new Set(societies.map((s) => s.category)));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <HomeContent societies={societies} categories={categories} />
    </main>
  );
}
