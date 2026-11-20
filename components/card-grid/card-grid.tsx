'use client';

import type { ReactNode, Ref } from 'react';

import { Checkbox } from '@/components/checkbox/checkbox';
import { Icon } from '@/components/icon/icon';
import { SelectField } from '@/components/select/select';

import styles from './card-grid.module.css';

export type CardGridSelection = {
  /** Cards currently visible. */
  pageCount: number;
  /** Visible cards that are selected. Drives the page checkbox. */
  selectedOnPage: number;
  /** Selected cards across pages. Shown in the count. */
  selectedCount: number;
  onSelectPage: (selected: boolean) => void;
  onClear: () => void;
  action?: ReactNode;
};

export type CardGridPagination = {
  page: number;
  pageSize: number;
  pageSizes: readonly number[];
  total: number | null;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
};

function selectionText(count: number): string {
  if (count === 0) return 'Nenhum selecionado';
  if (count === 1) return '1 selecionado';
  return `${count} selecionados`;
}

function SelectionBar({ selection }: { selection: CardGridSelection }) {
  const {
    pageCount,
    selectedOnPage,
    selectedCount,
    onSelectPage,
    onClear,
    action,
  } = selection;
  const all = pageCount > 0 && selectedOnPage === pageCount;

  return (
    <div className={styles.selection} role="group" aria-label="Seleção">
      <Checkbox
        label="Selecionar página"
        checked={all}
        indeterminate={selectedOnPage > 0 && !all}
        disabled={pageCount === 0}
        onCheckedChange={(checked) => onSelectPage(checked)}
      />
      <p className={styles.count}>{selectionText(selectedCount)}</p>
      {selectedCount > 0 ? (
        <button type="button" className={styles.clear} onClick={onClear}>
          Limpar seleção
        </button>
      ) : null}
      {action}
    </div>
  );
}

function Paginator({
  page,
  pageSize,
  pageSizes,
  total,
  onPage,
  onPageSize,
}: CardGridPagination) {
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
          options={pageSizes.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          onValueChange={(value) => {
            const size = Number(value);
            if (size !== pageSize) onPageSize(size);
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

/** Responsive card list, with an optional page selection bar and paginator. */
export function CardGrid({
  children,
  selection,
  pagination,
  busy = false,
  resultsRef,
}: {
  children: ReactNode;
  selection?: CardGridSelection;
  pagination?: CardGridPagination;
  busy?: boolean;
  resultsRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div className={styles.grid}>
      {selection ? <SelectionBar selection={selection} /> : null}
      <div
        ref={resultsRef}
        className={styles.results}
        tabIndex={-1}
        role="region"
        aria-label="Resultados"
        aria-busy={busy}
      >
        {children}
      </div>
      {pagination ? <Paginator {...pagination} /> : null}
    </div>
  );
}

export function CardGridList({
  children,
  hidden = false,
}: {
  children: ReactNode;
  hidden?: boolean;
}) {
  return (
    <ul className={styles.cards} aria-hidden={hidden || undefined}>
      {children}
    </ul>
  );
}
