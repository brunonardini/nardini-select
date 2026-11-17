-- Up Migration

SET lock_timeout = '3s';
SET statement_timeout = '15s';

-- squawk-ignore prefer-robust-stmts
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  token_hash bytea NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  canceled_at timestamptz,
  used_at timestamptz,
  used_by_user_id uuid
);

GRANT SELECT, DELETE ON invitations TO audit_maintainer;
