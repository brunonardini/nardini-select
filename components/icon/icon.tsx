import type { SVGProps } from 'react';
/** Line icon in `currentColor`, hidden from assistive technology. */
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & {
  name:
    | 'down'
    | 'pin'
    | 'whatsapp'
    | 'instagram'
    | 'lock'
    | 'google'
    | 'left'
    | 'home'
    | 'users'
    | 'roles'
    | 'history'
    | 'menu'
    | 'close'
    | 'collapse'
    | 'chevron'
    | 'profile'
    | 'sign-out'
    | 'search'
    | 'filter'
    | 'sort'
    | 'mail'
    | 'right';
}) {
  const paths = {
    home: <path d="m3 10 9-7 9 7v10h-6v-6H9v6H3z" />,
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20v-2a7 7 0 0 1 14 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 4 5" />
      </>
    ),
    roles: (
      <path d="m12 3 8 3v5c0 5-4 8-8 11-4-3-8-6-8-11V6zM8.5 12l2.5 2.5 4.5-5" />
    ),
    history: <path d="M4 7V3m0 4h4M4 7a9 9 0 1 1-1 8m9-8v5l4 2" />,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    collapse: <path d="m14 6-6 6 6 6m5-12-6 6 6 6" />,
    chevron: <path d="m7 10 5 5 5-5" />,
    right: <path d="m10 7 5 5-5 5" />,
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    filter: <path d="M4 7h10m4 0h2M4 17h2m4 0h10M16 5v4M8 15v4" />,
    sort: <path d="M8 4v16m0 0-3-3m3 3 3-3M16 20V4m0 0-3 3m3-3 3 3" />,
    mail: (
      <>
        <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
        <path d="m3.5 7 8.5 6.5L20.5 7" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    'sign-out': <path d="M11 4H4v16h7m-1-8h11m-4-4 4 4-4 4" />,
    left: <path d="M20 12H4M11 5l-7 7 7 7" />,
    google: (
      <path
        stroke="none"
        fill="currentColor"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.61 4.61 0 0 1-2 3.03v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.37ZM12 22c2.7 0 4.96-.9 6.62-2.4l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22ZM6.4 13.93a6 6 0 0 1 0-3.86V7.48H3.06a10 10 0 0 0 0 9.04l3.34-2.59ZM12 5.95c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.48l3.34 2.59A5.99 5.99 0 0 1 12 5.95Z"
      />
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    down: <path d="M12 4v16M5 13l7 7 7-7" />,
    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M21 11.5a9 9 0 0 1-13.4 7.9L3 21l1.6-4.6A9 9 0 1 1 21 11.5Z" />
        <path d="M8.1 7.2c-.4 0-1.2.7-1.2 1.7 0 2.7 4.3 6.9 7.1 6.9 1 0 1.8-.8 1.8-1.2v-1.1l-2.7-1.2-.9 1c-1.3-.6-2.4-1.7-3-3l1-.9L9.1 7.2Z" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
