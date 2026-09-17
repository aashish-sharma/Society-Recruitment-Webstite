"use client";

import type { Society } from "@/lib/types";
import { SocietyCard } from "@/components/societies/society-card";

const ALL = "All" as const;

interface SocietyListingProps {
  societies: Society[];
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function SocietyListing({
  societies,
  categories,
  activeCategory,
  onCategoryChange,
}: SocietyListingProps) {
  const active = categories.includes(activeCategory) ? activeCategory : ALL;

  const filtered =
    active === ALL
      ? societies
      : societies.filter((s) => s.category === active);

  const pills = [ALL, ...categories];

  return (
    <>
      {/* ── Filter pills ─────────────────────────────────────────── */}
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {pills.map((cat) => {
          const isActive = cat === active;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-primary text-primary-ink"
                  : "border border-line bg-surface text-ink-muted hover:border-primary hover:text-ink"
              }`}
              aria-pressed={isActive}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Society grid or empty state ───────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid-stagger mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((society) => (
            <SocietyCard key={society.id} society={society} />
          ))}
        </div>
      ) : (
        <div className="mt-8 py-12 text-center">
          <p className="text-base text-ink-muted">
            No societies match this filter — try another category.
          </p>
        </div>
      )}
    </>
  );
}
