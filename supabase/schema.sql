-- ============================================================
-- SOAR Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- ============================================================
-- 2. PROJECTS TABLE
-- ============================================================
create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,

  -- Core
  title         text not null,
  description   text not null,

  -- Banner
  banner_type   text not null default 'color'
                check (banner_type in ('color', 'image')),
  banner_value  text not null default '#1B2838',

  -- Timeline
  start_date    text,
  end_date      text,
  duration      text,
  time_commitment text,

  -- Compensation
  compensation_type   text not null default 'paid'
                      check (compensation_type in ('paid', 'unpaid', 'equity')),
  compensation_amount text,

  -- Project type
  project_type  text not null default ''
                check (project_type in ('', 'internship', 'research', 'volunteer', 'freelance', 'fellowship', 'contract', 'open-source')),

  -- Location
  location_type   text not null default 'remote'
                  check (location_type in ('remote', 'on-site', 'hybrid')),
  location_detail text[],

  -- Team
  skills           text[] not null default '{}',
  capacity         text,

  -- Settings
  require_approval boolean not null default false,
  visibility       text not null default 'public'
                   check (visibility in ('public', 'private')),
  status           text not null default 'draft'
                   check (status in ('draft', 'published')),

  -- Timestamps
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indexes
create index idx_projects_user_id on public.projects(user_id);
create index idx_projects_public_listing
  on public.projects(status, visibility, created_at desc);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 3. PROJECT ATTACHMENTS TABLE
-- ============================================================
create table public.project_attachments (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,

  file_name    text not null,
  file_type    text not null,
  storage_path text not null,

  position     smallint not null default 0,

  created_at   timestamptz not null default now()
);

create index idx_project_attachments_project
  on public.project_attachments(project_id);

-- ============================================================
-- 4. ROW LEVEL SECURITY — PROJECTS
-- ============================================================
alter table public.projects enable row level security;

-- Owners can insert projects as themselves
create policy "Users can insert their own projects"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Owners can read all their own projects (including drafts)
create policy "Owners can read own projects"
  on public.projects for select
  to authenticated
  using (auth.uid() = user_id);

-- Anyone can read published + public projects
create policy "Anyone can read published public projects"
  on public.projects for select
  to anon, authenticated
  using (status = 'published' and visibility = 'public');

-- Only owners can update
create policy "Owners can update own projects"
  on public.projects for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Only owners can delete
create policy "Owners can delete own projects"
  on public.projects for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 5. ROW LEVEL SECURITY — ATTACHMENTS
-- ============================================================
alter table public.project_attachments enable row level security;

create policy "Users can insert own attachments"
  on public.project_attachments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Owners can read own attachments"
  on public.project_attachments for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Anyone can read attachments for published public projects"
  on public.project_attachments for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and p.status = 'published'
        and p.visibility = 'public'
    )
  );

create policy "Owners can delete own attachments"
  on public.project_attachments for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 6. STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('project-banners', 'project-banners', true),
  ('project-attachments', 'project-attachments', true);

-- ============================================================
-- 7. STORAGE POLICIES — BANNERS
-- ============================================================

create policy "Users can upload their own banners"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-banners'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own banners"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-banners'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own banners"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-banners'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can read banners"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-banners');

-- ============================================================
-- 8. STORAGE POLICIES — ATTACHMENTS
-- ============================================================

create policy "Users can upload their own attachments"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own attachments"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can read attachments"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-attachments');

-- ============================================================
-- 9. ORGANIZATIONS TABLE
-- ============================================================
-- (already exists via migrations — included here for reference)

-- ============================================================
-- 10. USER PROFILES TABLE
-- ============================================================
create table public.user_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users(id) on delete cascade,

  role          text not null default 'applicant'
                check (role in ('poster', 'applicant', 'both')),

  -- Applicant fields (nullable — only used when role includes applicant)
  full_name     text,
  skills        text[] not null default '{}',
  portfolio_url text,
  resume_url    text,

  -- Timestamps
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_user_profiles_user_id on public.user_profiles(user_id);

create trigger set_updated_at_user_profiles
  before update on public.user_profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 11. APPLICATIONS TABLE
-- ============================================================
create table public.applications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  project_id    uuid not null references public.projects(id) on delete cascade,

  status        text not null default 'applied'
                check (status in ('applied', 'accepted', 'rejected', 'withdrawn')),

  message       text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique(user_id, project_id)
);

create index idx_applications_user_id on public.applications(user_id);
create index idx_applications_project_id on public.applications(project_id);

create trigger set_updated_at_applications
  before update on public.applications
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 12. ROW LEVEL SECURITY — USER PROFILES
-- ============================================================
alter table public.user_profiles enable row level security;

create policy "Users can insert own profile"
  on public.user_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can read own profile"
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Project owners can read applicant profiles"
  on public.user_profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.applications a
      join public.projects p on p.id = a.project_id
      where a.user_id = user_profiles.user_id
        and p.user_id = auth.uid()
    )
  );

create policy "Users can update own profile"
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 13. ROW LEVEL SECURITY — APPLICATIONS
-- ============================================================
alter table public.applications enable row level security;

create policy "Users can apply to projects"
  on public.applications for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can read own applications"
  on public.applications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Project owners can read applications to their projects"
  on public.applications for select
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy "Project owners can update application status"
  on public.applications for update
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy "Users can update own applications"
  on public.applications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 14. STORAGE BUCKET — RESUMES
-- ============================================================
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false);

create policy "Users can upload own resumes"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own resumes"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Project owners can read applicant resumes"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and exists (
      select 1 from public.applications a
      join public.projects p on p.id = a.project_id
      where a.user_id::text = (storage.foldername(name))[1]
        and p.user_id = auth.uid()
    )
  );

-- ============================================================
-- 15. MIGRATION — EXISTING USERS
-- ============================================================
-- Create user_profiles for existing organization owners
insert into public.user_profiles (user_id, role)
select user_id, 'poster'
from public.organizations
on conflict (user_id) do nothing;
