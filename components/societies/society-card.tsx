import Link from "next/link";
import { Society } from "@/lib/types";

interface SocietyCardProps {
  society: Society;
}

export function SocietyCard({ society }: SocietyCardProps) {
  return (
    <article
      className="flex flex-col gap-4 rounded-[4px] border border-line bg-surface p-5 transition-colors duration-150 hover:border-primary"
    >
      {/* Logo initials + name + category */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-primary font-heading text-sm font-semibold text-primary-ink"
          aria-hidden="true"
        >
          {society.logoInitials}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold leading-snug text-ink">
            {society.name}
          </h2>
          <span
            className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)",
              color: "var(--accent)",
            }}
          >
            {society.category}
          </span>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-sm leading-relaxed text-ink-muted">
        {society.tagline}
      </p>

      {/* View details link — text-style, not a boxed button */}
      <div className="mt-auto pt-1">
        <Link
          href={`/societies/${society.slug}`}
          className="inline-block min-h-[44px] min-w-[44px] pt-2 text-sm font-medium text-primary transition-colors duration-150 hover:text-accent"
        >
          View details →
        </Link>
      </div>
    </article>
  );
}
