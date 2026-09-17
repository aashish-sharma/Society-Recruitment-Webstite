# Society Recruitment Platform

A full-stack web platform built to streamline college society recruitment — students can browse societies, view open roles, and apply; admins can manage societies and track applicants, all backed by a real authentication and database layer instead of static mock data.

## Overview

Every semester, college societies handle recruitment through scattered forms, spreadsheets, and DMs. This project brings that process onto one platform: a public directory of societies, a proper application flow for students, and an admin panel for society coordinators to manage the whole pipeline — from open roles to final decisions.

## Features

**For students**
- Browse all societies as a searchable, filterable directory (by category)
- View a society's full profile: description, who should apply, open roles, recruitment process, and deadline
- Sign up / log in securely
- Apply to a specific role with inline-validated forms
- View the status of applications submitted (Pending / Accepted / Rejected)

**For admins**
- Create, edit, and delete societies and their open roles
- View all applicants for a given society, with filtering and search
- Update an applicant's status directly from the dashboard
- Admin access is enforced at the database level, not just hidden behind a route

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend / Auth | Supabase (Postgres, Auth) |
| Access control | Postgres Row Level Security (RLS) |
| Hosting | Vercel |

## Project structure

```
app/            → pages: home, society details, apply, auth, admin
components/     → reusable UI components
lib/            → Supabase clients, auth helpers, types, validation
data/           → local seed/reference data
supabase/
  migrations/   → SQL schema, indexes, triggers, and RLS policies
public/         → static assets
```

## Database schema

- **profiles** — one row per user, linked to `auth.users`, holds role (`student` / `admin`)
- **societies** — name, category, tagline, description, criteria, deadline
- **roles_open** — open roles per society (one-to-many)
- **recruitment_steps** — the recruitment process shown on a society's page
- **applications** — one row per student application, unique per (student, society, role)


---

Built by Aashish Sharma as a submission for GDG's society recruitment platform challenge.
