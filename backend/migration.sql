-- Run this in your Supabase SQL Editor

create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_type   text not null check (user_type in ('fresher', 'experienced'))
);

create table if not exists resumes (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  storage_url text,
  parsed_json jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists scores (
  id                       uuid primary key default gen_random_uuid(),
  resume_id                uuid not null references resumes(id) on delete cascade,
  overall_score            int not null,
  parameter_breakdown_json jsonb,
  created_at               timestamptz not null default now()
);

-- Storage bucket (run once, or create via Supabase dashboard)
-- insert into storage.buckets (id, name, public) values ('resumes', 'resumes', true)
-- on conflict do nothing;
