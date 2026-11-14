import Image from 'next/image';

type BrandLogoProps = {
  /** Accessible name of the link; the image alt alone says only the brand. */
  label: string;
  /** `sizes` for next/image, from the width the logo takes in each layout. */
  sizes: string;
  className?: string;
  loading?: 'eager' | 'lazy';
};

/** Horizontal Nardini Select logo, linking back to the top of the page. */
export function BrandLogo({
  label,
  sizes,
  className,
  loading,
}: BrandLogoProps) {
  return (
    <a className={className} href="#inicio" aria-label={label}>
      <Image
        src="/images/logo-horizontal.png"
        width={1938}
        height={563}
        sizes={sizes}
        alt="Nardini Select"
        loading={loading}
      />
    </a>
  );
}
