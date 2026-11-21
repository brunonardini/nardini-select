const AUDIT_MONTHS = 6;
const INVITATION_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type RetentionCutoffs = {
  /** Events strictly older than this instant are past the audit retention. */
  audit: string;
  /** Invitations strictly older than this instant are past their retention. */
  invitations: string;
};

function subtractUtcMonths(value: Date, months: number): Date {
  const day = value.getUTCDate();
  const shifted = new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth() - months,
      1,
      value.getUTCHours(),
      value.getUTCMinutes(),
      value.getUTCSeconds(),
      value.getUTCMilliseconds(),
    ),
  );
  const lastDay = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 0),
  ).getUTCDate();
  shifted.setUTCDate(Math.min(day, lastDay));
  return shifted;
}

/**
 * Cutoffs for one retention run. Audit rows live six calendar months.
 * Invitations live seven days. Both are UTC, and `now` is not changed.
 */
export function retentionCutoffs(now: Date): RetentionCutoffs {
  if (Number.isNaN(now.getTime())) {
    throw new Error('Invalid date.');
  }
  return {
    audit: subtractUtcMonths(now, AUDIT_MONTHS).toISOString(),
    invitations: new Date(
      now.getTime() - INVITATION_DAYS * DAY_MS,
    ).toISOString(),
  };
}
