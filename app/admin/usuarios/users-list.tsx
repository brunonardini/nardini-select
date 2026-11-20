'use client';

import { useEffect, useRef } from 'react';

import { Alert } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import { CardPlaceholder } from '@/components/card/card';
import { CardGrid, CardGridList } from '@/components/card-grid/card-grid';
import {
  PAGE_SIZES,
  pageSizeFrom,
  type UserListQuery,
} from '@/lib/users/logic/list-query';

import { ListToolbar } from './list-toolbar';
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
      <ListToolbar
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
