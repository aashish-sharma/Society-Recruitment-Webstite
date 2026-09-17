"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const isAdminPath = pathname.startsWith("/admin");

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href={isAdminPath ? "/admin" : "/"}
          className="font-heading text-xl font-semibold tracking-tight text-ink"
        >
          Society Recruitment
        </Link>

        <nav className="flex items-center gap-6 text-sm font-body text-ink-muted">
          {!isAdminPath && (
            <Link
              href="/"
              className="transition-colors hover:text-primary"
            >
              Home
            </Link>
          )}
          
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-6">
                  {isAdminPath && (
                    <Link
                      href="/"
                      className="transition-colors hover:text-primary"
                    >
                      Return to site
                    </Link>
                  )}
                  <span className="text-ink">Hi, {firstName}</span>
                  <button
                    onClick={handleLogout}
                    className="transition-colors hover:text-primary"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                !isAdminPath && (
                  <div className="flex items-center gap-6">
                    <Link
                      href="/login"
                      className="transition-colors hover:text-primary"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="transition-colors hover:text-primary"
                    >
                      Sign up
                    </Link>
                  </div>
                )
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
