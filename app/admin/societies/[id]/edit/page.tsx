import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SocietyForm } from "@/components/societies/society-form";
import type { Society, Role, ProcessStep } from "@/lib/types";

export default async function EditSocietyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: s, error } = await supabase
    .from("societies")
    .select(`
      *,
      roles:roles_open(*),
      process:recruitment_steps(*)
    `)
    .eq("id", id)
    .single();

  if (error || !s) {
    notFound();
  }

  const society: Society = {
    id: s.id,
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
  };

  return (
    <div>
      <div className="border-b border-line pb-6">
        <h1 className="font-heading text-2xl font-semibold text-ink">Edit Society: {society.name}</h1>
      </div>
      <div className="mt-8">
        <SocietyForm initialData={society} />
      </div>
    </div>
  );
}
