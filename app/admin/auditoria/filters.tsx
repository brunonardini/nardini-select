import type { ReactNode } from 'react';

import { auditCatalog, type AuditAction } from '@/lib/audit/logic/actions';
import {
  AUDIT_ENTITY_TYPES,
  type AuditEntityType,
  type AuditFilters,
} from '@/lib/audit/logic/query';

const ACTIONS = Object.keys(auditCatalog) as AuditAction[];

const ENTITY_LABELS: Record<AuditEntityType, string> = {
  user: 'Usuário',
  invitation: 'Convite',
  role: 'Papel',
};

function FilterField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="text-field">
      <label className="text-field-label" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function AuditFiltersForm({ filters }: { filters: AuditFilters }) {
  return (
    <form className="admin-form" action="/admin/auditoria" method="get">
      <FilterField id="audit-action" label="Ação">
        <select
          id="audit-action"
          className="text-field-control"
          name="acao"
          defaultValue={filters.action ?? ''}
        >
          <option value="">Todas</option>
          {ACTIONS.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </FilterField>
      <FilterField id="audit-entity-type" label="Tipo">
        <select
          id="audit-entity-type"
          className="text-field-control"
          name="entidade"
          defaultValue={filters.entityType ?? ''}
        >
          <option value="">Todos</option>
          {AUDIT_ENTITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {ENTITY_LABELS[type]}
            </option>
          ))}
        </select>
      </FilterField>
      <FilterField id="audit-from" label="De">
        <input
          id="audit-from"
          className="text-field-control"
          type="date"
          name="de"
          defaultValue={filters.from ?? ''}
        />
      </FilterField>
      <FilterField id="audit-to" label="Até">
        <input
          id="audit-to"
          className="text-field-control"
          type="date"
          name="ate"
          defaultValue={filters.to ?? ''}
        />
      </FilterField>
      <FilterField id="audit-actor" label="Ator">
        <input
          id="audit-actor"
          className="text-field-control"
          name="ator"
          defaultValue={filters.actorId ?? ''}
          placeholder="ID do ator"
        />
      </FilterField>
      <FilterField id="audit-entity" label="Entidade">
        <input
          id="audit-entity"
          className="text-field-control"
          name="entidade_id"
          defaultValue={filters.entityId ?? ''}
          placeholder="ID da entidade"
        />
      </FilterField>
      <button className="button button-primary" type="submit">
        Filtrar
      </button>
    </form>
  );
}
