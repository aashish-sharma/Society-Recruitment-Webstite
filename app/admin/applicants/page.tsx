import { createClient } from "@/lib/supabase/server";
import { ApplicantsTable } from "@/components/admin/applicants-table";
import { SocietySelect } from "@/components/societies/society-select";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ societyId?: string }>;
}) {
  const { societyId } = await searchParams;
  const supabase = await createClient();

  // Fetch all societies for the dropdown
  const { data: societies, error: societiesError } = await supabase
    .from("societies")
    .select("id, name")
    .order("name");

  if (societiesError) {
    console.error("Failed to fetch societies:", societiesError.message);
  }

  const hasSocieties = societies && societies.length > 0;
  
  // Determine which society to show
  let selectedId = societyId;
  if (!selectedId && hasSocieties) {
    selectedId = societies[0].id;
  }

  // Fetch applications for the selected society
  let applications: any[] = [];
  if (selectedId) {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        why,
        created_at,
        status,
        profiles(full_name, year, branch),
        roles_open(title)
      `)
      .eq("society_id", selectedId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch applications:", error.message);
    } else {
      applications = data || [];
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-6 gap-4">
        <h1 className="font-heading text-2xl font-semibold text-ink">Applicants</h1>
        
        {hasSocieties && (
          <div className="flex items-center gap-3">
            <label htmlFor="society-select" className="text-sm font-medium text-ink">
              Society:
            </label>
            <SocietySelect societies={societies} selectedId={selectedId!} />
          </div>
        )}
      </div>

      <div className="mt-8">
        {!hasSocieties ? (
          <p className="text-sm text-ink-muted">No societies exist yet.</p>
        ) : (
          <ApplicantsTable applications={applications} />
        )}
      </div>
    </div>
  );
}
