import { FiArrowUpRight } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-line/70">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-5 py-7 text-xs text-muted sm:flex-row sm:px-8 lg:px-12">
        <p><span className="mr-3 text-base font-extrabold tracking-tight text-secondary">gacha.</span> Less overthinking. More creating.</p>
        <div className="flex items-center gap-6"><span>Made for the undecided, by design.</span><a href="#" aria-label="Back to top" className="flex size-9 items-center justify-center rounded-lg border border-line transition hover:bg-elevated hover:text-accent"><FiArrowUpRight size={17} /></a></div>
      </div>
    </footer>
  );
}