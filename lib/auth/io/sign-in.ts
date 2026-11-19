import 'server-only';

import type { Kysely, Transaction } from 'kysely';

import type { DB } from '@/db/schema';
import { decideSignIn, type SignInDecision } from '@/lib/auth/logic/sign-in';

const profileImages = new Map<string, string | null>();

export function rememberProfileImage(
  email: string,
  image: string | null,
): void {
  const key = email.trim().toLowerCase();
  if (!key) return;
  profileImages.set(key, image);
  if (profileImages.size <= 50) return;
  const oldest = profileImages.keys().next().value;
  if (oldest) profileImages.delete(oldest);
}

function takeProfileImage(email: string): string | null {
  const key = email.trim().toLowerCase();
  const image = profileImages.get(key) ?? null;
  profileImages.delete(key);
  return image;
}

export async function prepareSession(
  db: Kysely<DB> | Transaction<DB>,
  input: { userId: string; now: Date },
): Promise<SignInDecision> {
  const user = await db
    .selectFrom('users')
    .select(['email', 'disabled_at', 'anonymized_at', 'photo_url'])
    .where('id', '=', input.userId)
    .executeTakeFirst();
  if (!user) return { ok: false, error: 'usuario_desabilitado' };

  const decision = decideSignIn({
    disabledAt: user.disabled_at,
    anonymizedAt: user.anonymized_at,
    currentPhotoUrl: user.photo_url,
    nextImage: takeProfileImage(user.email),
  });
  if (!decision.ok) return decision;

  await db
    .updateTable('users')
    .set({
      last_login_at: input.now.toISOString(),
      updated_at: input.now.toISOString(),
      ...(decision.photoUrl
        ? { photo_url: decision.photoUrl, photo_source: 'provider' as const }
        : {}),
    })
    .where('id', '=', input.userId)
    .execute();

  return decision;
}
