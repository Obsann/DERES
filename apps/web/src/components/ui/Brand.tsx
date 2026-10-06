import { Link } from 'react-router-dom';
import { LogoMark } from './LogoMark';
import { routes } from '@/routes/paths';

/** Wordmark used on bystander screens. Each page owns its own header. */
export function Brand({ dark = false, to = routes.home }: { dark?: boolean; to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 notranslate" translate="no" aria-label="DERES home">
      <LogoMark
        dark={dark}
        className={`grid size-10 place-items-center rounded-xl text-xl font-black leading-none ${
          dark ? 'bg-[#f35d43] text-[#07130f]' : 'bg-[#122d25] text-white'
        }`}
      />
      <span>
        <span className={`block text-[17px] font-extrabold tracking-[0.08em] ${dark ? 'text-white' : 'text-[#122d25]'}`}>
          DERES
        </span>
        <span
          className={`block text-[10px] font-semibold tracking-[0.18em] ${dark ? 'text-white/45' : 'text-[#64736e]'}`}
          lang="am"
        >
          ድረስ · REACH
        </span>
      </span>
    </Link>
  );
}
