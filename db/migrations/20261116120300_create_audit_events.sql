-- Up Migration

SET lock_timeout = '3s';
SET statement_timeout = '15s';

-- metadata_version stays smallint, as specified in the design.
-- squawk-ignore prefer-robust-stmts
CREATE TABLE audit.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL,
  actor_type text NOT NULL,
  actor_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL,
  metadata_version smallint NOT NULL, -- squawk-ignore prefer-bigint-over-smallint
  trace_id text,
  CONSTRAINT audit_events_actor_type_check CHECK (actor_type IN ('user', 'system'))
);

-- squawk-ignore prefer-robust-stmts,require-concurrent-index-creation
CREATE INDEX audit_events_occurred_at_id_idx ON audit.events (occurred_at, id);
-- squawk-ignore prefer-robust-stmts,require-concurrent-index-creation
CREATE INDEX audit_events_actor_id_idx ON audit.events (actor_id);
-- squawk-ignore prefer-robust-stmts,require-concurrent-index-creation
CREATE INDEX audit_events_entity_idx ON audit.events (entity_type, entity_id);
-- squawk-ignore prefer-robust-stmts,require-concurrent-index-creation
CREATE INDEX audit_events_action_idx ON audit.events (action);

GRANT INSERT, SELECT ON audit.events TO app_runtime;
GRANT SELECT, DELETE ON audit.events TO audit_maintainer;
