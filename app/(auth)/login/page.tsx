"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [resetting, setResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  /* ── Map Supabase Errors ─────────────────────────────────────── */
  const getFriendlyErrorMessage = (error: any) => {
    const msg = error?.message || "";
    if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
      return "That email or password doesn't match an account.";
    }
    if (msg.includes("Email not confirmed")) {
      return "Please confirm your email address before logging in.";
    }
    return msg;
  };

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetSent(false);

    if (!email.trim() || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setSubmitting(false);

    if (error) {
      setAuthError(getFriendlyErrorMessage(error));
      return;
    }

    // Refresh the router so Server Components (like the Header) pick up the new session
    router.refresh();
    router.push(redirectUrl);
  };

  /* ── Password Reset ──────────────────────────────────────────── */
  const handleResetPassword = async () => {
    setAuthError(null);
    setResetSent(false);

    if (!email.trim()) {
      setAuthError("Please enter your email address to reset your password.");
      return;
    }

    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetting(false);

    if (error) {
      setAuthError(getFriendlyErrorMessage(error));
      return;
    }

    setResetSent(true);
  };

  return (
    <div className="mt-8">
      {authError && (
        <div className="mb-6 rounded-[4px] border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-ink">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            required
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || resetting}
            className="flex w-full items-center justify-center rounded-[4px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-ink transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin text-primary-ink"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={submitting || resetting}
          className="text-sm font-medium text-primary transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resetting ? "Sending..." : "Forgot password?"}
        </button>
        {resetSent && (
          <p className="text-center text-xs text-ink-muted">
            If that email exists, we've sent a reset link.
          </p>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-ink-muted">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[420px] flex-col justify-center px-6 py-12">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">
          Log in
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Welcome back. Log in to track your applications.
        </p>
      </div>

      <Suspense fallback={<div className="mt-8 text-center text-sm text-ink-muted">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
