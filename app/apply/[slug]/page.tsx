import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { ApplyForm } from "@/components/societies/apply-form";

// Helper for static generation metadata
function getStaticSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/* ── Metadata ──────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const supabase = getStaticSupabase();
  const { data: society } = await supabase.from('societies').select('name').eq('slug', decodedSlug).single();
  
  if (!society) return { title: "Society not found" };
  return {
    title: `Apply — ${society.name}`,
    description: `Application form for ${society.name}.`,
  };
}

/* ── Page ──────────────────────────────────────────────────────── */
export default async function ApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const supabase = await createClient();
  const profile = await getProfile(supabase);

  if (!profile) {
    const { role } = await searchParams;
    let redirectUrl = `/apply/${slug}`;
    if (role) {
      redirectUrl += `?role=${role}`;
    }
    redirect(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }

  // Fetch society
  const { data: society } = await supabase
    .from('societies')
    .select('id, name, slug, roles_open(id, title, description)')
    .eq('slug', decodedSlug)
    .single();

  if (!society) notFound();

  const roles = (society.roles_open || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description
  }));

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      {/* Back link */}
      <Link
        href={`/societies/${encodeURIComponent(society.slug)}`}
        className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors duration-150 hover:text-primary"
      >
        ← {society.name}
      </Link>

      <h1 className="mt-6 font-heading text-2xl font-semibold text-ink sm:text-3xl">
        Apply to {society.name}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Fill in the details below. All fields are required.
      </p>

      <div className="mt-8">
        {/* Suspense boundary needed because useSearchParams triggers client-side rendering */}
        <Suspense fallback={null}>
          <ApplyForm
            societyId={society.id}
            societyName={society.name}
            societySlug={society.slug}
            roles={roles}
            defaultName={profile.full_name || ""}
            defaultYear={profile.year || ""}
            defaultBranch={profile.branch || ""}
          />
        </Suspense>
      </div>
    </div>
  );
}
