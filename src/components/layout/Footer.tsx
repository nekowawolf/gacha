export default function Footer() {
  return (
    <footer className="mt-14 border-t border-line/70">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-5 px-5 py-7 text-xs text-muted sm:px-8 lg:flex-row lg:px-12">
        <p className="text-center lg:text-left"><span className="mr-3 text-base font-extrabold tracking-tight text-secondary">gacha.</span> Random selection with custom categories.</p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-secondary lg:justify-end">
          <span>&copy; {new Date().getFullYear()} Gacha</span>
          <span className="text-muted">·</span>
          <span className="text-muted">Powered by</span>
          <a href="https://www.nekowawolf.xyz/ecosystem" target="_blank" rel="noopener noreferrer" className="group relative font-medium text-blue-500 transition-colors hover:text-blue-400">
            Nww Ecosystem
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-blue-500 transition-[width] duration-300 group-hover:w-full" />
          </a>
        </div>
      </div>
    </footer>
  );
}