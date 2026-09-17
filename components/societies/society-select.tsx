"use client";

import { useRouter } from "next/navigation";

export function SocietySelect({
  societies,
  selectedId,
}: {
  societies: { id: string; name: string }[];
  selectedId: string;
}) {
  const router = useRouter();
  
  return (
    <select
      id="society-select"
      value={selectedId}
      onChange={(e) => {
        router.push(`/admin/applicants?societyId=${e.target.value}`);
      }}
      className="rounded-[4px] border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
    >
      {societies.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
