import { BrandLogo } from '../brand-logo/brand-logo';
import { MainNavigation } from './main-navigation';

/** Top of the home page: the brand logo and the main navigation. */
export function SiteHeader() {
  return (
    <header className="site-header">
      <BrandLogo
        className="brand-link"
        label="Nardini Select — início"
        sizes="(max-width: 760px) 170px, (max-width: 1100px) 190px, 220px"
        loading="eager"
      />
      <MainNavigation />
    </header>
  );
}
