'use client';

import { Button } from '@/components/button/button';
import {
  Filter,
  PopoverActions,
  PopoverForm,
  ToolbarPopover,
} from '@/components/filter/filter';
import { Icon } from '@/components/icon/icon';
import { SelectField } from '@/components/select/select';
import {
  NO_ROLE,
  parseUserListQuery,
  STATE_SLUGS,
  type UserListQuery,
} from '@/lib/users/logic/list-query';

import styles from './users.module.css';

const ANY = 'todos';

type Role = { id: string; name: string };

type Props = {
  query: UserListQuery;
  search: string;
  roles: Role[];
  onSearch: (value: string) => void;
  onChange: (changes: Partial<Omit<UserListQuery, 'search' | 'page'>>) => void;
};

function valuesOf(data: FormData) {
  return Object.fromEntries(data);
}

export function ListToolbar({
  query,
  search,
  roles,
  onSearch,
  onChange,
}: Props) {
  const stateOptions = [
    { value: ANY, label: 'Todos os estados' },
    ...Object.entries(STATE_SLUGS).map(([value, label]) => ({ value, label })),
  ];
  const roleOptions = [
    { value: ANY, label: 'Todos os papéis' },
    { value: NO_ROLE, label: 'Sem papel' },
    ...roles.map((role) => ({ value: role.id, label: role.name })),
  ];

  return (
    <div className={styles.toolbar} role="search">
      <label className={styles.search}>
        <span className="sr-only">Buscar por nome ou e-mail</span>
        <Icon name="search" />
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Buscar por nome ou e-mail"
          value={search}
          maxLength={100}
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>
      <Filter
        label="Filtros"
        title="Filtrar equipe"
        submitLabel="Aplicar filtros"
        clearLabel="Limpar filtros"
        onSubmit={(data) => {
          const parsed = parseUserListQuery(valuesOf(data));
          onChange({ state: parsed.state, role: parsed.role });
        }}
        onClear={() => onChange({ state: null, role: null })}
      >
        <SelectField
          label="Estado"
          name="estado"
          defaultValue={query.state ?? ANY}
          options={stateOptions}
        />
        <SelectField
          label="Papel"
          name="papel"
          defaultValue={query.role ?? ANY}
          options={roleOptions}
        />
      </Filter>
      <ToolbarPopover label="Ordenar" icon="sort" title="Ordenar equipe">
        {(close) => (
          <PopoverForm
            onSubmit={(event) => {
              event.preventDefault();
              const parsed = parseUserListQuery(
                valuesOf(new FormData(event.currentTarget)),
              );
              onChange({ sort: parsed.sort, direction: parsed.direction });
              close();
            }}
          >
            <SelectField
              label="Ordenar por"
              name="ordem"
              defaultValue={query.sort}
              options={[
                { value: 'pessoa', label: 'Pessoa' },
                { value: 'papel', label: 'Papel' },
                { value: 'estado', label: 'Estado' },
              ]}
            />
            <SelectField
              label="Direção"
              name="direcao"
              defaultValue={query.direction}
              options={[
                { value: 'asc', label: 'Crescente' },
                { value: 'desc', label: 'Decrescente' },
              ]}
            />
            <PopoverActions>
              <Button type="submit">Aplicar ordem</Button>
            </PopoverActions>
          </PopoverForm>
        )}
      </ToolbarPopover>
    </div>
  );
}
