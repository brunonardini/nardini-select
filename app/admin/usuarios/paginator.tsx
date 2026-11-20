'use client';

import { Icon } from '@/components/icon/icon';
import { SelectField } from '@/components/select/select';
import {
  PAGE_SIZES,
  pageSizeFrom,
  type PageSize,
} from '@/lib/users/logic/list-query';

import styles from './users.module.css';

type Props = {
  page: number;
  pageSize: PageSize;
  total: number | null;
  onPage: (page: number) => void;
  onPageSize: (size: PageSize) => void;
};

export function Paginator({
  page,
  pageSize,
  total,
  onPage,
  onPageSize,
}: Props) {
  const known = total !== null;
  const lastPage = known ? Math.max(1, Math.ceil(total / pageSize)) : null;
  const first = known && total > 0 ? (page - 1) * pageSize + 1 : 0;
  const last = known ? Math.min(page * pageSize, total) : 0;

  return (
    <div className={styles.paginator}>
      <div className={styles.pageSize}>
        <SelectField
          key={pageSize}
          label="Por página"
          name="por_pagina"
          defaultValue={String(pageSize)}
          options={PAGE_SIZES.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          onValueChange={(value) => {
            const size = pageSizeFrom(value);
            if (size && size !== pageSize) onPageSize(size);
          }}
        />
      </div>
      <p className={styles.pageLabel}>
        {known ? `${first}–${last} de ${total}` : '–'}
      </p>
      <nav className={styles.pageNav} aria-label="Paginação">
        <button
          type="button"
          className={styles.pageButton}
          aria-label="Página anterior"
          disabled={!known || page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <Icon name="left" />
        </button>
        <span className={styles.pageLabel}>
          {lastPage ? `Página ${page} de ${lastPage}` : '–'}
        </span>
        <button
          type="button"
          className={styles.pageButton}
          aria-label="Próxima página"
          disabled={!lastPage || page >= lastPage}
          onClick={() => onPage(page + 1)}
        >
          <Icon name="right" />
        </button>
      </nav>
    </div>
  );
}
