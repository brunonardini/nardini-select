drop table if exists sessions, user_accounts, verifications, users, invitations cascade;

create table users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  email text not null unique,
  email_verified boolean not null default false,
  photo_url text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  provider_id text not null,
  provider_account_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_id, provider_account_id)
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table verifications (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  value text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table invitations (
  id uuid primary key,
  label text not null,
  used_at timestamptz
);
