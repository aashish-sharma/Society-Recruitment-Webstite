"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect, useRef, type FormEvent } from "react";
import type { Role } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";

/* ── Types ─────────────────────────────────────────────────────── */

interface FieldErrors {
  name?: string;
  year?: string;
  branch?: string;
  role?: string;
  why?: string;
  form?: string;
}

interface ApplyFormProps {
  societyId: string;
  societyName: string;
  societySlug: string;
  roles: Role[];
  defaultName?: string;
  defaultYear?: string;
  defaultBranch?: string;
}

const YEAR_OPTIONS = ["1st", "2nd", "3rd", "4th"] as const;
const WHY_MIN_LENGTH = 30;

/* ── Component ─────────────────────────────────────────────────── */

export function ApplyForm({ societyId, societyName, societySlug, roles, defaultName, defaultYear, defaultBranch }: ApplyFormProps) {
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get("role") ?? "";
  const { user, profile } = useAuth();
  const supabase = createClient();

  /* ── Form state ──────────────────────────────────────────────── */
  const [name, setName] = useState(defaultName || "");
  const [year, setYear] = useState(defaultYear || "");
  const [branch, setBranch] = useState(defaultBranch || "");
  const [role, setRole] = useState(preselectedRole);
  const [why, setWhy] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Synchronize state if props or auth profile resolves
  useEffect(() => {
    setName((prev) => prev || defaultName || profile?.full_name || (user?.user_metadata?.full_name as string) || "");
    setYear((prev) => prev || defaultYear || profile?.year || (user?.user_metadata?.year as string) || "");
    setBranch((prev) => prev || defaultBranch || profile?.branch || (user?.user_metadata?.branch as string) || "");
  }, [defaultName, defaultYear, defaultBranch, profile, user]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  /* Track what was submitted for the confirmation screen */
  const submittedPayload = useRef<{
    name: string;
    roleTitle: string;
    society: string;
  } | null>(null);

  /* ── Validation ──────────────────────────────────────────────── */
  const validate = useCallback(
    (fields?: { n?: string; y?: string; b?: string; r?: string; w?: string }) => {
      const n = fields?.n ?? name;
      const y = fields?.y ?? year;
      const b = fields?.b ?? branch;
      const r = fields?.r ?? role;
      const w = fields?.w ?? why;

      const e: FieldErrors = {};
      if (!n.trim()) e.name = "Full name is required.";
      if (!y) e.year = "Please select your year.";
      if (!b.trim()) e.branch = "Branch is required.";
      if (!r) e.role = "Please select a role.";
      if (!w.trim()) {
        e.why = "This field is required.";
      } else if (w.trim().length < WHY_MIN_LENGTH) {
        e.why = `At least ${WHY_MIN_LENGTH} characters required (${w.trim().length} so far).`;
      }
      return e;
    },
    [name, year, branch, role, why],
  );

  const currentErrors = validate();
  const isValid = Object.keys(currentErrors).length === 0;

  /* Show an error only if the field has been touched or the form was attempted */
  const [attempted, setAttempted] = useState(false);
  const showError = (field: keyof FieldErrors) =>
    (touched[field] || attempted) && currentErrors[field];

  /* ── Blur handler ────────────────────────────────────────────── */
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    setServerError(null);

    if (!isValid || !user) return;

    setLoading(true);

    // Update profile info just in case they changed it here
    await supabase.from('profiles').update({
      full_name: name.trim(),
      year,
      branch: branch.trim(),
    }).eq('id', user.id);

    // Insert application
    const { error } = await supabase.from('applications').insert({
      society_id: societyId,
      applicant_id: user.id,
      role_id: role,
      why: why.trim(),
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setServerError(error.message.includes('unique constraint') 
        ? "You have already applied to this society." 
        : "Something went wrong submitting your application. Please try again.");
      return;
    }

    const roleTitle = roles.find((r) => r.id === role)?.title ?? role;
    submittedPayload.current = {
      name: name.trim(),
      roleTitle,
      society: societyName,
    };
    setSubmitted(true);
  };

  /* ── Confirmation state ──────────────────────────────────────── */
  if (submitted && submittedPayload.current) {
    const { name: applicantName, roleTitle, society } = submittedPayload.current;
    return (
      <div className="rounded-[4px] border border-line bg-surface px-6 py-8 sm:px-8">
        <div className="flex items-start gap-3">
          {/* Small success check */}
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--success) 14%, transparent)",
              color: "var(--success)",
            }}
            aria-hidden="true"
          >
            ✓
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">
              Application received
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {applicantName} applied for <strong>{roleTitle}</strong> at{" "}
              <strong>{society}</strong>.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="rounded-[2px] text-sm font-medium text-primary transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            ← Back to all societies
          </Link>
        </div>
      </div>
    );
  }

  /* ── Form ────────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Full name */}
      <div>
        <label htmlFor="apply-name" className="block text-sm font-medium text-ink">
          Full name
        </label>
        <input
          id="apply-name"
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

      {/* Year */}
      <div>
        <label htmlFor="apply-year" className="block text-sm font-medium text-ink">
          Year
        </label>
        <select
          id="apply-year"
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

      {/* Branch */}
      <div>
        <label htmlFor="apply-branch" className="block text-sm font-medium text-ink">
          Branch
        </label>
        <input
          id="apply-branch"
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

      {/* Role */}
      <div>
        <label htmlFor="apply-role" className="block text-sm font-medium text-ink">
          Role
        </label>
        <select
          id="apply-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          onBlur={() => handleBlur("role")}
          className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">Select a role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
        {showError("role") && (
          <p className="mt-1.5 text-xs text-danger">{currentErrors.role}</p>
        )}
      </div>

      {/* Why you */}
      <div>
        <label htmlFor="apply-why" className="block text-sm font-medium text-ink">
          Why are you a good fit?
        </label>
        <textarea
          id="apply-why"
          rows={4}
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          onBlur={() => handleBlur("why")}
          className="mt-1.5 block w-full resize-y rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Tell us briefly why you want this role and what you'd bring to the team."
        />
        <div className="mt-1.5 flex items-start justify-between gap-4">
          {showError("why") ? (
            <p className="text-xs text-danger">{currentErrors.why}</p>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-xs text-ink-muted">
            {why.trim().length}/{WHY_MIN_LENGTH} min
          </span>
        </div>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={(attempted && !isValid) || loading}
          className="rounded-[4px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-ink transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit application"}
        </button>
        {attempted && !isValid && (
          <p className="mt-2 text-xs text-danger">
            Please fix the errors above before submitting.
          </p>
        )}
        {serverError && (
          <p className="mt-2 text-xs text-danger">
            {serverError}
          </p>
        )}
      </div>
    </form>
  );
}
