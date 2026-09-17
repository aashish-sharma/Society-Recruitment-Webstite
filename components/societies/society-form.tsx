"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Society } from "@/lib/types";

interface SocietyFormProps {
  initialData?: Society;
}

const CATEGORIES = ["Technical", "Cultural", "Sports", "Literary"] as const;

export function SocietyForm({ initialData }: SocietyFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    category: initialData?.category ?? "Technical",
    tagline: initialData?.tagline ?? "",
    logo_initials: initialData?.logoInitials ?? "",
    description: initialData?.description ?? "",
    criteria: initialData?.criteria ?? "",
    founded_year: initialData?.foundedYear?.toString() ?? "",
    member_count: initialData?.memberCount?.toString() ?? "",
    meeting_cadence: initialData?.meetingCadence ?? "",
    deadline: initialData?.deadline ?? "",
  });

  const [roles, setRoles] = useState(
    initialData?.roles?.map(r => ({ title: r.title, description: r.description })) ?? []
  );

  const [steps, setSteps] = useState(
    initialData?.process?.map((p, i) => ({ title: p.title, description: p.description, step_order: i + 1 })) ?? []
  );

  // UI State
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Name is required.";
    if (!formData.slug.trim()) e.slug = "Slug is required.";
    if (!formData.tagline.trim()) e.tagline = "Tagline is required.";
    if (!formData.logo_initials.trim()) e.logo_initials = "Logo initials required.";
    if (formData.logo_initials.length > 2) e.logo_initials = "Max 2 characters.";
    if (!formData.description.trim()) e.description = "Description is required.";
    if (!formData.criteria.trim()) e.criteria = "Criteria is required.";
    if (!formData.founded_year || isNaN(Number(formData.founded_year))) e.founded_year = "Valid year required.";
    if (!formData.member_count || isNaN(Number(formData.member_count))) e.member_count = "Valid number required.";
    if (!formData.meeting_cadence.trim()) e.meeting_cadence = "Meeting cadence is required.";
    if (!formData.deadline.trim()) e.deadline = "Deadline is required.";
    
    roles.forEach((r, i) => {
      if (!r.title.trim()) e[`role_${i}_title`] = "Title is required.";
      if (!r.description.trim()) e[`role_${i}_desc`] = "Description is required.";
    });

    steps.forEach((s, i) => {
      if (!s.title.trim()) e[`step_${i}_title`] = "Title is required.";
      if (!s.description.trim()) e[`step_${i}_desc`] = "Description is required.";
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const payload = {
      p_society: {
        id: initialData?.id ?? null,
        ...formData,
      },
      p_roles: roles,
      p_steps: steps.map((s, i) => ({ ...s, step_order: i + 1 })),
    };

    const { error } = await supabase.rpc("admin_upsert_society", payload);
    setLoading(false);

    if (error) {
      setErrors({ form: error.message });
      console.error(error);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[4px] border border-line bg-surface px-6 py-8 sm:px-8">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
            style={{
              backgroundColor: "color-mix(in srgb, var(--success) 14%, transparent)",
              color: "var(--success)",
            }}
          >
            ✓
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">
              Society {initialData ? "updated" : "created"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {formData.name} has been successfully saved to the database.
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-4">
          <Link
            href="/admin/societies"
            className="rounded-[2px] text-sm font-medium text-primary transition-colors hover:text-accent"
          >
            ← Back to societies
          </Link>
          {!initialData && (
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ ...formData, name: "", slug: "" });
              }}
              className="rounded-[2px] text-sm font-medium text-primary transition-colors hover:text-accent"
            >
              Create another
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderError = (field: string) => {
    return errors[field] ? <p className="mt-1.5 text-xs text-danger">{errors[field]}</p> : null;
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      
      {/* ── Basic Info ──────────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-heading text-lg font-semibold text-ink">Basic Info</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-ink">Society Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {renderError("name")}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">URL Slug</label>
            <input
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {renderError("slug")}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Logo Initials (Max 2)</label>
            <input
              name="logo_initials"
              value={formData.logo_initials}
              onChange={handleChange}
              maxLength={2}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {renderError("logo_initials")}
          </div>
        </div>
      </section>

      {/* ── Details ─────────────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-heading text-lg font-semibold text-ink">Details</h2>
        <div className="mt-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink">Tagline</label>
            <input
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {renderError("tagline")}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1.5 block w-full resize-y rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {renderError("description")}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Criteria (Who should apply)</label>
            <textarea
              name="criteria"
              value={formData.criteria}
              onChange={handleChange}
              rows={3}
              className="mt-1.5 block w-full resize-y rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {renderError("criteria")}
          </div>
        </div>
      </section>

      {/* ── Stats & Logistics ──────────────────────────────────────────────── */}
      <section>
        <h2 className="font-heading text-lg font-semibold text-ink">Stats & Logistics</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-ink">Founded Year</label>
            <input
              name="founded_year"
              type="number"
              value={formData.founded_year}
              onChange={handleChange}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {renderError("founded_year")}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Member Count</label>
            <input
              name="member_count"
              type="number"
              value={formData.member_count}
              onChange={handleChange}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {renderError("member_count")}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Meeting Cadence</label>
            <input
              name="meeting_cadence"
              value={formData.meeting_cadence}
              onChange={handleChange}
              placeholder="e.g. Weekly, Saturday afternoons"
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {renderError("meeting_cadence")}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Deadline</label>
            <input
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              className="mt-1.5 block w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {renderError("deadline")}
          </div>
        </div>
      </section>

      {/* ── Roles ──────────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-ink">Open Roles</h2>
          <button
            type="button"
            onClick={() => setRoles([...roles, { title: "", description: "" }])}
            className="text-sm font-medium text-primary hover:text-accent transition-colors"
          >
            + Add Role
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {roles.map((role, index) => (
            <div key={index} className="rounded-[4px] border border-line bg-surface p-4 relative">
              <button
                type="button"
                onClick={() => setRoles(roles.filter((_, i) => i !== index))}
                className="absolute top-4 right-4 text-xs font-medium text-danger hover:opacity-80"
              >
                Remove
              </button>
              <div className="grid gap-4 sm:pr-16">
                <div>
                  <label className="block text-xs font-medium text-ink">Role Title</label>
                  <input
                    value={role.title}
                    onChange={(e) => {
                      const newRoles = [...roles];
                      newRoles[index].title = e.target.value;
                      setRoles(newRoles);
                    }}
                    className="mt-1 block w-full rounded-[4px] border border-line bg-transparent px-3 py-1.5 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  {renderError(`role_${index}_title`)}
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink">Description</label>
                  <textarea
                    value={role.description}
                    rows={2}
                    onChange={(e) => {
                      const newRoles = [...roles];
                      newRoles[index].description = e.target.value;
                      setRoles(newRoles);
                    }}
                    className="mt-1 block w-full resize-y rounded-[4px] border border-line bg-transparent px-3 py-1.5 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  {renderError(`role_${index}_desc`)}
                </div>
              </div>
            </div>
          ))}
          {roles.length === 0 && <p className="text-sm text-ink-muted">No roles added yet.</p>}
        </div>
      </section>

      {/* ── Recruitment Steps ──────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-ink">Recruitment Process</h2>
          <button
            type="button"
            onClick={() => setSteps([...steps, { title: "", description: "", step_order: steps.length + 1 }])}
            className="text-sm font-medium text-primary hover:text-accent transition-colors"
          >
            + Add Step
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="rounded-[4px] border border-line bg-surface p-4 relative">
              <button
                type="button"
                onClick={() => setSteps(steps.filter((_, i) => i !== index))}
                className="absolute top-4 right-4 text-xs font-medium text-danger hover:opacity-80"
              >
                Remove
              </button>
              <div className="grid gap-4 sm:pr-16">
                <div>
                  <label className="block text-xs font-medium text-ink">Step {index + 1} Title</label>
                  <input
                    value={step.title}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[index].title = e.target.value;
                      setSteps(newSteps);
                    }}
                    className="mt-1 block w-full rounded-[4px] border border-line bg-transparent px-3 py-1.5 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  {renderError(`step_${index}_title`)}
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink">Description</label>
                  <textarea
                    value={step.description}
                    rows={2}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[index].description = e.target.value;
                      setSteps(newSteps);
                    }}
                    className="mt-1 block w-full resize-y rounded-[4px] border border-line bg-transparent px-3 py-1.5 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  {renderError(`step_${index}_desc`)}
                </div>
              </div>
            </div>
          ))}
          {steps.length === 0 && <p className="text-sm text-ink-muted">No steps added yet.</p>}
        </div>
      </section>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 border-t border-line pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-[4px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save society"}
        </button>
        <Link
          href="/admin/societies"
          className="text-sm font-medium text-ink transition-colors hover:text-primary"
        >
          Cancel
        </Link>
      </div>
      {errors.form && (
        <p className="text-sm text-danger mt-2">{errors.form}</p>
      )}
    </form>
  );
}
