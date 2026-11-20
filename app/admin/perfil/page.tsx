import { requirePage } from '@/lib/auth/io/guard';
import { getUser, hasStoredGooglePhoto } from '@/lib/users/io/users';

import { ProfileForm } from './profile-form';

export default async function ProfilePage() {
  const ctx = await requirePage({ allow: ['pending', 'active'] });
  const user = await getUser(ctx, ctx.viewer.id);
  if (!user) return null;

  return (
    <section className="admin-panel">
      <h1>Perfil</h1>
      <ProfileForm
        userId={user.id}
        displayName={user.displayName ?? ''}
        fullName={user.fullName}
        email={user.email}
        photoSource={user.photoSource}
        hasGooglePhoto={hasStoredGooglePhoto(user.photoUrl)}
      />
    </section>
  );
}
