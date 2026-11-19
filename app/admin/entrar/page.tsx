import Image, { getImageProps } from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/button/button';
import { Icon } from '@/components/icon/icon';
import { SIGN_IN_ERRORS, signInErrorText } from '@/lib/auth/logic/errors';

import { SignInButton } from './sign-in-button';
import styles from './sign-in.module.css';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; error?: string }>;
}) {
  const params = await searchParams;
  const message = signInErrorText(params.erro ?? params.error);
  const denied = message === SIGN_IN_ERRORS.acesso_negado;
  const image = {
    alt: '',
    loading: 'eager' as const,
    fetchPriority: 'high' as const,
  };
  const { props: mobile } = getImageProps({
    ...image,
    src: '/images/admin-sign-in-mobile.webp',
    width: 768,
    height: 1152,
    sizes: '100vw',
  });
  const { props: desktop } = getImageProps({
    ...image,
    src: '/images/admin-sign-in-desktop.webp',
    width: 1024,
    height: 1536,
    sizes: '80vw',
  });

  return (
    <section className={styles.page} aria-labelledby="sign-in-title">
      <picture className={styles.scene}>
        <source
          media="(min-width: 701px)"
          srcSet={desktop.srcSet}
          sizes="80vw"
        />
        {/* getImageProps is Next's art-direction API; only the matching source loads. */}
        <img {...mobile} alt="" />
      </picture>
      <div className={styles.veil} aria-hidden="true" />
      <div className={styles.header}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="Nardini Select — Admin"
        >
          <Image
            src="/images/logo-horizontal.png"
            alt="Nardini Select"
            width={210}
            height={61}
          />
          <span className={styles.admin}>
            Ad<span>min</span>
          </span>
        </Link>
        <Button
          variant="secondary"
          className={styles.back}
          href="/"
          leadingIcon={<Icon name="left" />}
        >
          Voltar ao site
        </Button>
      </div>
      <div className={styles.content}>
        <h1 id="sign-in-title">
          Por trás de
          <br />
          cada escolha.
        </h1>
        <p className={styles.intro}>
          Seu espaço para cuidar da operação e levar nossa curadoria a mais
          cães.
        </p>
        <SignInButton
          initialMessage={
            denied
              ? 'Esta conta não tem acesso. Use outra conta Google ou peça um convite ao administrador.'
              : message
          }
          initialTitle={denied ? 'Acesso negado' : 'Não foi possível entrar'}
        />
        <p className={styles.restriction}>
          <Icon name="lock" />
          Acesso restrito para funcionários
        </p>
      </div>
    </section>
  );
}
