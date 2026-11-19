/** Fake invitation tokens for seed data. They are not secrets. */
export const INVITE_TOKENS = {
  valid: 'v'.repeat(43),
  expired: 'e'.repeat(43),
  canceled: 'c'.repeat(43),
  used: 'u'.repeat(43),
} as const;
