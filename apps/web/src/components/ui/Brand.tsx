import { Link } from 'react-router-dom';
import { LogoMark } from './LogoMark';
import { routes } from '@/routes/paths';

/** Official lockup on light screens; shield mark on dark emergency chrome. */
export function Brand({ dark = false, to = routes.home }: { dark?: boolean; to?: string }) {
  return (
    <Link to={to} className="flex shrink-0 items-center notranslate" translate="no" aria-label="DERES home">
      {dark ? (
        <span className="rounded-xl bg-white p-1 shadow-sm">
          <LogoMark compact className="h-10 w-10 md:h-11 md:w-11" />
        </span>
      ) : (
        <LogoMark className="h-[4.25rem] w-auto rounded-xl md:h-[4.75rem]" />
      )}
    </Link>
  );
}
