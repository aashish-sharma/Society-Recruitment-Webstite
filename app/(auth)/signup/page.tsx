"use client";

import Link from "next/link";
import { useState, useCallback, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const YEAR_OPTIONS = ["1st", "2nd", "3rd", "4th"] as const;

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  year?: string;
  branch?: string;
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  /* ── Validation ──────────────────────────────────────────────── */
  const validate = useCallback(
    (fields?: { n?: string; e?: string; p?: string; cp?: string; y?: string; b?: string }) => {
      const n = fields?.n ?? name;
      const e = fields?.e ?? email;
      const p = fields?.p ?? password;
      const cp = fields?.cp ?? confirmPassword;
      const y = fields?.y ?? year;
      const b = fields?.b ?? branch;

      const errors: FieldErrors = {};
      if (!n.trim()) errors.name = "Full name is required.";
      if (!e.trim()) {
        errors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        errors.email = "Please enter a valid email address.";
      }
      if (!p) {
        errors.password = "Password is required.";
      } else if (p.length < 8) {
        errors.password = "Password must be at least 8 characters.";
      }
      if (cp !== p) {
        errors.confirmPassword = "Passwords do not match.";
      }
      if (!y) errors.year = "Please select your year.";
      if (!b.trim()) errors.branch = "Branch is required.";

      return errors;
    },
    [name, email, password, confirmPassword, year, branch],
  );

  const currentErrors = validate();
  const isValid = Object.keys(currentErrors).length === 0;

  const showError = (field: keyof FieldErrors) =>
    (touched[field] || attempted) && currentErrors[field];

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    setAuthError(null);

    if (!isValid) return;

    setSubmitting(true);

    const { data: authData, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          year,
          branch: branch.trim(),
        },
      },
    });

    if (authData?.session?.user) {
      await supabase.from("profiles").update({
        full_name: name.trim(),
        year,
        branch: branch.trim(),
      }).eq("id", authData.session.user.id);
    }

    setSubmitting(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    setSuccess(true);
  };

  /* ── Success state ───────────────────────────────────────────── */
  if (success) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[420px] flex-col justify-center px-6 py-12">
        <div className="rounded-[4px] border border-line bg-surface px-6 py-8 sm:px-8">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
              style={{
                backgroundColor: "color-mix(in srgb, var(--success) 14%, transparent)",
                color: "var(--success)",
              }}
              aria-hidden="true"
            >
              ✓
            </span>
            <div>
              <h2 className="font-heading text-lg font-semibold text-ink">
                Check your email
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                We've sent a confirmation link to <strong>{email}</strong>. Please click the link to activate your account.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/"
              className="rounded-[2px] text-sm font-medium text-primary transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ── Form state ──────────────────────────────────────────────── */
  return (
    <main className="mx-auto max-w-[420px] px-6 py-12">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">
          Create your account
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Join to apply for societies and track your applications.
        </p>
      </div>

      <div className="mt-8">
        {authError && (
          <div className="mb-6 rounded-[4px] border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-ink">
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur("name")}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. Priya Sharma"
            />
            {showError("name") && (
              <p className="mt-1.5 text-xs text-danger">{currentErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-ink">
              Email address
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="you@example.com"
            />
            {showError("email") && (
              <p className="mt-1.5 text-xs text-danger">{currentErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Min. 8 characters"
            />
            {showError("password") && (
              <p className="mt-1.5 text-xs text-danger">{currentErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-medium text-ink">
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Re-enter password"
            />
            {showError("confirmPassword") && (
              <p className="mt-1.5 text-xs text-danger">{currentErrors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-year" className="block text-sm font-medium text-ink">
              Year
            </label>
            <select
              id="signup-year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              onBlur={() => handleBlur("year")}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select year</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y} year
                </option>
              ))}
            </select>
            {showError("year") && (
              <p className="mt-1.5 text-xs text-danger">{currentErrors.year}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-branch" className="block text-sm font-medium text-ink">
              Branch
            </label>
            <input
              id="signup-branch"
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              onBlur={() => handleBlur("branch")}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. Computer Science"
            />
            {showError("branch") && (
              <p className="mt-1.5 text-xs text-danger">{currentErrors.branch}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || (attempted && !isValid)}
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
            {attempted && !isValid && (
              <p className="mt-2 text-center text-xs text-danger">
                Please fix the errors above before submitting.
              </p>
            )}
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
