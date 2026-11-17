-- Up Migration

SET lock_timeout = '3s';
SET statement_timeout = '15s';

-- squawk-ignore prefer-robust-stmts
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  display_name text,
  email text NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  photo_url text,
  photo_source text NOT NULL DEFAULT 'none',
  role_id uuid REFERENCES roles (id) ON DELETE RESTRICT,
  invited_at timestamptz,
  registered_at timestamptz,
  last_login_at timestamptz,
  disabled_at timestamptz,
  anonymized_at timestamptz,
  terms_version text,
  terms_accepted_at timestamptz,
  privacy_notice_version text,
  privacy_notice_acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_photo_source_check CHECK (photo_source IN ('provider', 'none'))
);

-- squawk-ignore prefer-robust-stmts,require-concurrent-index-creation
CREATE INDEX users_role_id_idx ON users (role_id);

-- squawk-ignore prefer-robust-stmts
CREATE TABLE user_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  provider_id text NOT NULL,
  provider_account_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, provider_account_id)
);

-- squawk-ignore prefer-robust-stmts,require-concurrent-index-creation
CREATE INDEX user_accounts_user_id_idx ON user_accounts (user_id);

-- squawk-ignore prefer-robust-stmts
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- squawk-ignore prefer-robust-stmts,require-concurrent-index-creation
CREATE INDEX sessions_user_id_idx ON sessions (user_id);

-- squawk-ignore prefer-robust-stmts
CREATE TABLE verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- squawk-ignore prefer-robust-stmts,require-concurrent-index-creation
CREATE INDEX verifications_identifier_idx ON verifications (identifier);
