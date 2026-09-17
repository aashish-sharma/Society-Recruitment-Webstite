import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteSocietyButton } from "@/components/admin/delete-society-button";

export default async function AdminSocietiesPage() {
  const supabase = await createClient();
  const { data: societies, error } = await supabase
    .from("societies")
    .select("id, name, category, deadline, member_count")
    .order("name");

  if (error) {
    console.error("Failed to fetch societies:", error.message);
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-line pb-6">
        <h1 className="font-heading text-2xl font-semibold text-ink">Societies</h1>
        <Link
          href="/admin/societies/new"
          className="rounded-[4px] bg-primary px-4 py-2 text-sm font-semibold text-primary-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          New society
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="pb-3 pr-4 font-semibold text-ink">Name</th>
              <th className="pb-3 pr-4 font-semibold text-ink">Category</th>
              <th className="pb-3 pr-4 font-semibold text-ink">Deadline</th>
              <th className="pb-3 pr-4 font-semibold text-ink text-right">Members</th>
              <th className="pb-3 pl-4 font-semibold text-ink text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(societies || []).map((society) => (
              <tr key={society.id} className="group transition-colors hover:bg-surface">
                <td className="py-4 pr-4 font-medium text-ink">{society.name}</td>
                <td className="py-4 pr-4 text-ink-muted">{society.category}</td>
                <td className="py-4 pr-4 text-ink-muted">{society.deadline}</td>
                <td className="py-4 pr-4 text-ink-muted text-right">{society.member_count}</td>
                <td className="py-4 pl-4 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/societies/${society.id}/edit`}
                      className="text-sm font-medium text-primary transition-colors hover:text-accent"
                    >
                      Edit
                    </Link>
                    <DeleteSocietyButton id={society.id} />
                  </div>
                </td>
              </tr>
            ))}
            {(!societies || societies.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ink-muted">
                  No societies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
