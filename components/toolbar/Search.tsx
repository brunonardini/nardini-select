'use client';

import { Icon } from '@/components/icon/icon';

import styles from './toolbar.module.css';

/** Search field. It fills the width of its parent. */
export function Search({
  label,
  value,
  onChange,
  maxLength = 100,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <div className={styles.search} role="search">
      <label>
        <span className="sr-only">{label}</span>
        <Icon name="search" />
        <input
          className={styles.searchInput}
          type="search"
          placeholder={label}
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}
