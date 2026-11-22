import Link from 'next/link';
import type { ReactNode } from 'react';

import { Checkbox } from '@/components/checkbox/checkbox';

import styles from './card.module.css';

export type CardFact = {
  key: string;
  label: ReactNode;
  value: ReactNode;
};

/** One record in a card grid. Selection is optional and off unless wired. */
export function Card({
  title,
  href,
  leading,
  description,
  facts = [],
  selected = false,
  onSelectedChange,
  children,
}: {
  title: string;
  href?: string;
  leading?: ReactNode;
  description?: ReactNode;
  facts?: CardFact[];
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Actions and other content that belong to this record. */
  children?: ReactNode;
}) {
  const name = href ? (
    <Link className={styles.name} href={href}>
      {title}
    </Link>
  ) : (
    <span className={styles.name}>{title}</span>
  );

  return (
    <li className={styles.card} data-selected={selected ? '' : undefined}>
      <div className={styles.top}>
        {leading}
        {name}
        {onSelectedChange ? (
          <Checkbox
            className={styles.select}
            label={`Selecionar ${title}`}
            labelHidden
            checked={selected}
            onCheckedChange={(checked) => onSelectedChange(checked)}
          />
        ) : null}
      </div>
      {description ? <p className={styles.description}>{description}</p> : null}
      {facts.length > 0 ? (
        <div className={styles.facts}>
          {facts.map((fact) => (
            <div key={fact.key}>
              <span>{fact.label}</span>
              <span>{fact.value}</span>
            </div>
          ))}
        </div>
      ) : null}
      {children}
    </li>
  );
}

/** Non-interactive placeholder in the same grid as the cards. */
export function CardPlaceholder() {
  return <li className={styles.skeleton} aria-hidden="true" />;
}
