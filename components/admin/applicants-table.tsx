"use client";

import { useState } from "react";
import { ApplicantStatusSelect } from "./applicant-status-select";

interface Application {
  id: string;
  why: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    year: string;
    branch: string;
  };
  roles_open: {
    title: string;
  };
}

interface ApplicantsTableProps {
  applications: Application[];
}

function TruncatedText({ text, limit = 100 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= limit) return <span>{text}</span>;

  if (expanded) {
    return (
      <div>
        <span>{text}</span>
        <button
          onClick={() => setExpanded(false)}
          className="ml-2 text-primary hover:underline text-xs"
        >
          Show less
        </button>
      </div>
    );
  }

  return (
    <div>
      <span>{text.slice(0, limit)}...</span>
      <button
        onClick={() => setExpanded(true)}
        className="ml-2 text-primary hover:underline text-xs"
      >
        Show more
      </button>
    </div>
  );
}

export function ApplicantsTable({ applications }: ApplicantsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = applications.filter((app) => {
    if (statusFilter !== "All" && app.status !== statusFilter) return false;
    if (search.trim()) {
      const name = app.profiles?.full_name?.toLowerCase() || "";
      if (!name.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <label htmlFor="search" className="block text-xs font-medium text-ink mb-1">
            Search by Name
          </label>
          <input
            id="search"
            type="text"
            placeholder="e.g. Priya"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-[4px] border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label htmlFor="statusFilter" className="block text-xs font-medium text-ink mb-1">
            Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-[4px] border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="pb-3 pr-4 font-semibold text-ink">Applicant</th>
              <th className="pb-3 pr-4 font-semibold text-ink">Role</th>
              <th className="pb-3 pr-4 font-semibold text-ink w-1/3">Why You</th>
              <th className="pb-3 pr-4 font-semibold text-ink">Date</th>
              <th className="pb-3 font-semibold text-ink">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((app) => (
              <tr key={app.id} className="group hover:bg-surface transition-colors align-top">
                <td className="py-4 pr-4">
                  <div className="font-medium text-ink">{app.profiles?.full_name || "Unknown"}</div>
                  <div className="text-xs text-ink-muted">
                    {app.profiles?.year} Year • {app.profiles?.branch}
                  </div>
                </td>
                <td className="py-4 pr-4 text-ink">
                  {app.roles_open?.title || "Unknown"}
                </td>
                <td className="py-4 pr-4 text-ink-muted leading-relaxed">
                  <TruncatedText text={app.why} />
                </td>
                <td className="py-4 pr-4 text-ink-muted whitespace-nowrap">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="py-4">
                  <ApplicantStatusSelect applicationId={app.id} initialStatus={app.status} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ink-muted">
                  No applicants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
