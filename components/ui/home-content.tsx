"use client";

import { useState } from "react";
import { SocietyListing } from "@/components/societies/society-listing";
import { SocietyQuiz } from "@/components/societies/society-quiz";
import type { Society } from "@/lib/types";

interface HomeContentProps {
  societies: Society[];
  categories: string[];
}

export function HomeContent({ societies, categories }: HomeContentProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-ink sm:text-4xl">
          Find your society
        </h1>
        <p className="mt-3 max-w-[68ch] text-base leading-relaxed text-ink-muted">
          Browse the societies currently recruiting on campus. Pick one that
          interests you, read up on what they do, and apply before the deadline.
        </p>
      </div>

      {/* Quiz — collapsible, inline */}
      <SocietyQuiz onResult={setActiveCategory} />

      {/* Filter bar + grid */}
      <SocietyListing
        societies={societies}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
    </>
  );
}
