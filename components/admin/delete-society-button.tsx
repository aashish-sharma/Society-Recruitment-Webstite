"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteSocietyButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase.from("societies").delete().eq("id", id);
    setLoading(false);
    
    if (error) {
      console.error("Failed to delete:", error.message);
      // We could set an error state here, but inline for now is fine
    } else {
      setConfirming(false);
      router.refresh(); // Refresh the server component to update the table
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-ink-muted">
          Delete this society? This also removes its roles and applications.
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-semibold text-danger transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-xs font-medium text-ink transition-colors hover:text-primary disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm font-medium text-danger transition-colors hover:text-danger/80"
    >
      Delete
    </button>
  );
}
