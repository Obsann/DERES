/** The DERES mark: Ethiopic ድ on the emergency square. */
export function LogoMark({
  className = 'grid size-10 place-items-center rounded-xl bg-[#122d25] text-xl font-black leading-none text-white',
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <span
      className={
        className ||
        `grid size-10 place-items-center rounded-xl text-xl font-black leading-none ${
          dark ? 'bg-[#f35d43] text-[#07130f]' : 'bg-[#122d25] text-white'
        }`
      }
      aria-hidden="true"
    >
      ድ
    </span>
  );
}
