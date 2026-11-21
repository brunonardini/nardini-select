/** Current legal documents. The public pages show these values. */
export const TERMS_VERSION = '2026-11-20';

export const PRIVACY_NOTICE_VERSION = '2026-11-20';

const VERSION_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Long date in pt-BR for a `YYYY-MM-DD` document version, read as a UTC day. */
export function legalVersionDate(version: string): string {
  const match = VERSION_DATE.exec(version);
  if (!match) throw new Error('Invalid legal version.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error('Invalid legal version.');
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
