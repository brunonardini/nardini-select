-- Idempotent roles and grants. Passwords are placeholders replaced by
-- apply.ts and never belong in this file.
--
-- Sections:
--   @roles             cluster-wide, superuser, once
--   @database-grants   current database, superuser, each application database
--   @schema-grants     current database, superuser or app_migrator

-- @roles

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_migrator') THEN
    CREATE ROLE app_migrator LOGIN PASSWORD __APP_MIGRATOR_PASSWORD__;
  ELSE
    ALTER ROLE app_migrator WITH LOGIN PASSWORD __APP_MIGRATOR_PASSWORD__;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_runtime') THEN
    CREATE ROLE app_runtime LOGIN PASSWORD __APP_RUNTIME_PASSWORD__;
  ELSE
    ALTER ROLE app_runtime WITH LOGIN PASSWORD __APP_RUNTIME_PASSWORD__;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'audit_maintainer') THEN
    CREATE ROLE audit_maintainer LOGIN PASSWORD __AUDIT_MAINTAINER_PASSWORD__;
  ELSE
    ALTER ROLE audit_maintainer WITH LOGIN PASSWORD __AUDIT_MAINTAINER_PASSWORD__;
  END IF;
END
$$;

ALTER ROLE app_migrator SET timezone TO 'UTC';
ALTER ROLE app_runtime SET timezone TO 'UTC';
ALTER ROLE audit_maintainer SET timezone TO 'UTC';

-- @database-grants

DO $$
DECLARE
  database_name name := current_database();
BEGIN
  EXECUTE format('REVOKE ALL ON DATABASE %I FROM PUBLIC', database_name);
  EXECUTE format(
    'GRANT CONNECT ON DATABASE %I TO app_migrator, app_runtime, audit_maintainer',
    database_name
  );
  EXECUTE format('GRANT CREATE ON DATABASE %I TO app_migrator', database_name);
END
$$;

-- @schema-grants

REVOKE CREATE ON SCHEMA public FROM PUBLIC;

CREATE SCHEMA IF NOT EXISTS audit;

ALTER SCHEMA public OWNER TO app_migrator;
ALTER SCHEMA audit OWNER TO app_migrator;

GRANT USAGE ON SCHEMA public TO app_runtime;
GRANT USAGE ON SCHEMA audit TO app_runtime;
-- Table grants are useless without schema USAGE.
GRANT USAGE ON SCHEMA public TO audit_maintainer;
GRANT USAGE ON SCHEMA audit TO audit_maintainer;

ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_runtime;
