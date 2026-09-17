"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { name: "Societies", href: "/admin/societies" },
    { name: "Applicants", href: "/admin/applicants" },
  ];

  return (
    <nav className="mt-4 flex flex-col gap-3">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              isActive ? "text-primary underline" : "text-ink-muted hover:text-ink"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
