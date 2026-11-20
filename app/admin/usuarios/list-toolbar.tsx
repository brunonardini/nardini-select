'use client';

import { Popover } from '@base-ui/react/popover';
import { useState, type FormEvent, type ReactNode } from 'react';

import { Button } from '@/components/button/button';
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

function ToolPopover({
  label,
  icon,
  title,
  children,
}: {
  label: string;
  icon: 'filter' | 'sort';
  title: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={styles.toolButton}>
        <Icon name={icon} />
        {label}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          className={styles.positioner}
          align="start"
          sideOffset={8}
          collisionPadding={12}
        >
          <Popover.Popup className={styles.popup}>
            <Popover.Title className={styles.popupTitle}>{title}</Popover.Title>
            {children(() => setOpen(false))}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function formValues(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  return Object.fromEntries(new FormData(event.currentTarget));
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
      <ToolPopover label="Filtros" icon="filter" title="Filtrar equipe">
        {(close) => (
          <form
            className={styles.popupForm}
            onSubmit={(event) => {
              const parsed = parseUserListQuery(formValues(event));
              onChange({ state: parsed.state, role: parsed.role });
              close();
            }}
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
            <div className={styles.popupActions}>
              <Button type="submit">Aplicar filtros</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  onChange({ state: null, role: null });
                  close();
                }}
              >
                Limpar filtros
              </Button>
            </div>
          </form>
        )}
      </ToolPopover>
      <ToolPopover label="Ordenar" icon="sort" title="Ordenar equipe">
        {(close) => (
          <form
            className={styles.popupForm}
            onSubmit={(event) => {
              const parsed = parseUserListQuery(formValues(event));
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
            <div className={styles.popupActions}>
              <Button type="submit">Aplicar ordem</Button>
            </div>
          </form>
        )}
      </ToolPopover>
    </div>
  );
}
