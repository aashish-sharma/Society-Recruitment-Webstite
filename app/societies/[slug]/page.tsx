import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Society, Role, ProcessStep } from "@/lib/types";

// Helper for static generation
function getStaticSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/* ── Static params for SSG ─────────────────────────────────────── */
export async function generateStaticParams() {
  const supabase = getStaticSupabase();
  const { data: societies } = await supabase.from('societies').select('slug');
  return (societies || []).map((s: { slug: string }) => ({ slug: s.slug }));
}

/* ── Metadata ──────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const supabase = getStaticSupabase(); // use static client to avoid cookie errors during build
  const { data: society } = await supabase.from('societies').select('name, description').eq('slug', decodedSlug).single();
  
  if (!society) return { title: "Society not found" };
  return {
    title: `${society.name} — Society Recruitment`,
    description: society.description,
  };
}

/* ── Helpers ───────────────────────────────────────────────────── */

/** "2026-10-02" → "Applications close 2 Oct 2026" */
function formatDeadline(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  return `Applications close ${day} ${month} ${year}`;
}

/* ── Page ──────────────────────────────────────────────────────── */
export default async function SocietyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const supabase = await createClient();
  const { data: s, error } = await supabase
    .from('societies')
    .select(`
      *,
      roles:roles_open(*),
      process:recruitment_steps(*)
    `)
    .eq('slug', decodedSlug)
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
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors duration-150 hover:text-primary"
      >
        ← All societies
      </Link>

      {/* ── Header row ─────────────────────────────────────────── */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-semibold text-ink sm:text-4xl">
            {society.name}
          </h1>
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--accent) 15%, transparent)",
              color: "var(--accent)",
            }}
          >
            {society.category}
          </span>
        </div>

        <p className="mt-2 text-base leading-relaxed text-ink-muted">
          {society.tagline}
        </p>
      </div>

      {/* ── Two-column body ────────────────────────────────────── */}
      <div className="mt-10 flex flex-col gap-0 lg:flex-row">
        {/* ─ Main column: description + at a glance + process ─ */}
        <div className="flex-1 lg:pr-10">
          <h2 className="font-heading text-lg font-semibold text-ink">
            About
          </h2>
          <p className="prose-measure mt-3 text-base leading-relaxed text-ink-muted">
            {society.description}
          </p>

          {/* ── At a glance ──────────────────────────────────────── */}
          <h2 className="mt-8 font-heading text-lg font-semibold text-ink">
            At a glance
          </h2>
          <div className="mt-4 flex flex-wrap">
            {[
              { label: "Founded", value: String(society.foundedYear) },
              { label: "Members", value: String(society.memberCount) },
              { label: "Schedule", value: society.meetingCadence },
              { label: "Category", value: society.category },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`py-2 pr-5 ${
                  i > 0 ? "border-l border-line pl-5" : ""
                }`}
              >
                <p className="text-xs font-medium text-ink-muted">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* ── How recruitment works ─────────────────────────────── */}
          <h2 className="mt-8 font-heading text-lg font-semibold text-ink">
            How recruitment works
          </h2>
          <ol className="mt-4 space-y-4">
            {society.process.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-sm font-semibold text-primary">
                  {i + 1}.
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ─ Hairline divider ─ */}
        <div className="my-8 border-t border-line lg:my-0 lg:border-t-0 lg:border-l lg:border-line" />

        {/* ─ Side panel: criteria + roles + deadline ─ */}
        <div className="lg:w-[340px] lg:shrink-0 lg:pl-10">
          {/* Criteria */}
          <h2 className="font-heading text-lg font-semibold text-ink">
            Who should apply
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {society.criteria}
          </p>

          {/* Roles */}
          <h2 className="mt-8 font-heading text-lg font-semibold text-ink">
            Open roles
          </h2>
          <ul className="mt-4 space-y-5">
            {society.roles.map((role) => (
              <li key={role.id}>
                <p className="text-sm font-semibold text-ink">{role.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {role.description}
                </p>
                <Link
                  href={`/apply/${encodeURIComponent(society.slug)}?role=${role.id}`}
                  className="mt-2 inline-block text-sm font-medium text-primary transition-colors duration-150 hover:text-accent"
                >
                  Apply for this role →
                </Link>
              </li>
            ))}
          </ul>

          {/* Deadline */}
          <p className="mt-8 rounded-[4px] border border-line bg-surface px-4 py-3 text-sm font-medium text-ink">
            {formatDeadline(society.deadline)}
          </p>
        </div>
      </div>
    </div>
  );
}
