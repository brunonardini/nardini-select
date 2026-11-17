-- Up Migration
-- admin role id is duplicated in db/seeds/ids.ts

SET lock_timeout = '3s';
SET statement_timeout = '15s';

-- New tables in this transaction are not visible until commit, so a
-- non-concurrent index does not block other sessions.
-- squawk-ignore prefer-robust-stmts
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- squawk-ignore prefer-robust-stmts,require-concurrent-index-creation
CREATE UNIQUE INDEX roles_name_lower_idx ON roles (lower(name));

-- squawk-ignore prefer-robust-stmts
CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  PRIMARY KEY (role_id, permission_key)
);

INSERT INTO roles (id, name, is_system)
VALUES ('a1d00000-0000-4000-8000-000000000001', 'admin', true);
