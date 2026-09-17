import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const profile = await getProfile(supabase);

  // UX convenience check for admin role
  if (!profile || profile.role !== 'admin') {
    redirect("/");
  }

  return (
    <div className="mx-auto flex max-w-5xl gap-10 px-6 py-12">
      {/* Left sidebar nav */}
      <aside className="w-48 shrink-0">
        <h2 className="font-heading text-lg font-semibold text-ink">Admin Panel</h2>
        <AdminNav />
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
