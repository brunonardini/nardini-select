'use client';

import { useEffect, useRef } from 'react';

import { Alert } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import { CardPlaceholder } from '@/components/card/card';
import { CardGrid, CardGridList } from '@/components/card-grid/card-grid';
import { SelectField } from '@/components/select/select';
import { Toolbar } from '@/components/toolbar';
import { FiltersAction } from '@/components/toolbar/FiltersAction';
import { OrderByAction } from '@/components/toolbar/OrderByAction';
import { Search } from '@/components/toolbar/Search';
import {
  NO_ROLE,
  PAGE_SIZES,
  pageSizeFrom,
  parseUserListQuery,
  STATE_SLUGS,
  type UserListQuery,
} from '@/lib/users/logic/list-query';

import { useUserList } from './use-user-list';
import { UserCard } from './user-card';
import styles from './users.module.css';

type Props = {
  roles: { id: string; name: string }[];
  initialQuery: UserListQuery;
  pageSizeInAddress: boolean;
};

function statusText(total: number | null): string {
  if (total === null) return '';
  if (total === 0) return 'Nenhum resultado';
  return total === 1 ? '1 pessoa encontrada' : `${total} pessoas encontradas`;
}

export function UsersList({ roles, initialQuery, pageSizeInAddress }: Props) {
  const list = useUserList(initialQuery, pageSizeInAddress);
  const results = useRef<HTMLDivElement>(null);
  const total = list.result?.total ?? null;
  const page = list.result?.page ?? list.query.page;
  const focusPending = useRef(false);
  // Focus moves once the new page is in place, after any popup returns focus.
  const focusResults = () => {
    focusPending.current = true;
  };

  useEffect(() => {
    if (list.status === 'loading' || !focusPending.current) return;
    focusPending.current = false;
    results.current?.focus();
  }, [list.status, list.result]);

  return (
    <section className={styles.team} aria-labelledby="equipe">
      <h2 id="equipe" className={styles.teamHeading}>
        Equipe
        <span className={styles.badge}>
          {total ?? (
            <>
              –<span className="sr-only">, carregando</span>
            </>
          )}
        </span>
      </h2>
      <TeamToolbar
        query={list.query}
        search={list.search}
        roles={roles}
        onSearch={list.setSearch}
        onChange={list.update}
      />
      <p className="sr-only" role="status">
        {list.status === 'ready' ? statusText(total) : ''}
      </p>
      <CardGrid
        resultsRef={results}
        busy={list.status === 'loading'}
        pagination={{
          page,
          pageSize: list.query.pageSize,
          pageSizes: PAGE_SIZES,
          total,
          onPage: (next) => {
            list.goToPage(next);
            focusResults();
          },
          onPageSize: (size) => {
            const parsed = pageSizeFrom(String(size));
            if (!parsed) return;
            list.setPageSize(parsed);
            focusResults();
          },
        }}
      >
        {list.status === 'error' ? (
          <div className={styles.empty}>
            <Alert
              variant="danger"
              title="Não foi possível carregar os usuários"
            >
              Verifique a conexão e tente de novo.
            </Alert>
            <Button type="button" variant="secondary" onClick={list.retry}>
              Tentar novamente
            </Button>
          </div>
        ) : list.result === null ? (
          <CardGridList hidden>
            {Array.from({ length: list.query.pageSize }, (_, index) => (
              <CardPlaceholder key={index} />
            ))}
          </CardGridList>
        ) : list.result.items.length === 0 ? (
          <div className={styles.empty}>
            <p>
              <strong>Nenhum resultado</strong>
            </p>
            <Button type="button" variant="outline" onClick={list.clearAll}>
              Limpar busca e filtros
            </Button>
          </div>
        ) : (
          <CardGridList>
            {list.result.items.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </CardGridList>
        )}
      </CardGrid>
    </section>
  );
}

const ANY = 'todos';

function valuesOf(data: FormData) {
  return Object.fromEntries(data);
}

function TeamToolbar({
  query,
  search,
  roles,
  onSearch,
  onChange,
}: {
  query: UserListQuery;
  search: string;
  roles: { id: string; name: string }[];
  onSearch: (value: string) => void;
  onChange: (changes: Partial<Omit<UserListQuery, 'search' | 'page'>>) => void;
}) {
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
    <Toolbar>
      <Toolbar.Content>
        <Search
          label="Buscar por nome ou e-mail"
          value={search}
          onChange={onSearch}
        />
      </Toolbar.Content>
      <Toolbar.Actions>
        <FiltersAction
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
        </FiltersAction>
        <OrderByAction
          label="Ordenar"
          title="Ordenar equipe"
          submitLabel="Aplicar ordem"
          onSubmit={(data) => {
            const parsed = parseUserListQuery(valuesOf(data));
            onChange({ sort: parsed.sort, direction: parsed.direction });
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
        </OrderByAction>
      </Toolbar.Actions>
    </Toolbar>
  );
}
