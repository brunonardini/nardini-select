import Image from 'next/image';

import { avatarInitials } from '@/lib/users/logic/rules';

type Props = {
  name: string | null;
  /** Same-origin avatar route. Omitted when the person has no photo. */
  src?: string | null;
  /** Include the visible initials in a parent control's accessible name. */
  announceInitials?: boolean;
};

/** Photo or initials. The name beside it carries the accessible name. */
export function Avatar({ name, src, announceInitials = false }: Props) {
  if (!src) {
    return (
      <span
        className="avatar"
        aria-hidden={announceInitials ? undefined : true}
      >
        {avatarInitials(name)}
      </span>
    );
  }

  return (
    <Image
      className="avatar"
      src={src}
      alt=""
      width={48}
      height={48}
      unoptimized
    />
  );
}
