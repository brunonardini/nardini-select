import styles from './status-text.module.css';

const markers: Record<string, string> = {
  Ativo: styles.active,
  Pendente: styles.pending,
  'Termos desatualizados': styles.outdated,
  Desabilitado: styles.disabled,
  Anonimizado: styles.anonymized,
};

/** Written account state with a decorative dot. The text carries the meaning. */
export function StatusText({ state }: { state: string }) {
  return (
    <span className={styles.status}>
      <span
        className={`${styles.marker} ${markers[state] ?? styles.anonymized}`}
        aria-hidden="true"
      />
      {state}
    </span>
  );
}
