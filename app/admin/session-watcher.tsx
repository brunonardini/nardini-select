'use client';

import { useEffect } from 'react';

import { authClient } from '@/lib/auth/io/client';

/** After a logout in another tab, the next focus leaves the admin area. */
export function SessionWatcher() {
  useEffect(() => {
    const onFocus = () => {
      void authClient.getSession().then((result) => {
        if (!result.data) {
          // A full load drops the signed-in client state. A client transition would not.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign('/admin/entrar');
        }
      });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return null;
}
