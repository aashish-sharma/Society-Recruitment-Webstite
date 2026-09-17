"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ApplicantStatusSelectProps {
  applicationId: string;
  initialStatus: string;
}

const STATUSES = ["Pending", "Accepted", "Rejected"];

export function ApplicantStatusSelect({ applicationId, initialStatus }: ApplicantStatusSelectProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const supabase = createClient();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const oldStatus = status;
    setStatus(newStatus);
    setLoading(true);
    setSaveState("idle");

    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    setLoading(false);

    if (error) {
      console.error("Failed to update status:", error);
      setStatus(oldStatus); // revert
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    } else {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={handleChange}
        disabled={loading}
        className="rounded-[4px] border border-line bg-surface px-2 py-1 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {saveState === "saved" && (
        <span className="text-xs font-medium text-success">Saved ✓</span>
      )}
      {saveState === "error" && (
        <span className="text-xs font-medium text-danger">Error</span>
      )}
    </div>
  );
}
