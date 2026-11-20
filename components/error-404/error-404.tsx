import Image from 'next/image';
import type { ReactNode } from 'react';
import styles from './error-404.module.css';

/** Fixed illustration and title; the caller owns recovery actions. */
export function Error404({
  description = 'Até debaixo do tapete. Mas esta página não foi encontrada.',
  children,
}: {
  /** Safe explanation; never pass a raw exception message. */
  description?: string;
  /** Recovery controls, stacked in narrow containers and inline in wide ones. */
  children?: ReactNode;
}) {
  return (
    <section className={styles.frame}>
      <div className={styles.content}>
        <Image
          className={styles.image}
          src="/images/error-404-rug.webp"
          alt=""
          width={1200}
          height={800}
          sizes="(max-width: 524px) calc(100vw - 44px), 480px"
          loading="eager"
        />
        <h1 className={styles.title}>Procurei em todo canto.</h1>
        <p className={styles.description}>{description}</p>
        {children ? <div className={styles.actions}>{children}</div> : null}
      </div>
    </section>
  );
}
