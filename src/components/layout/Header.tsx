"use client";

import Image from "next/image";
import { useState } from "react";
import { FiArrowUpRight, FiHelpCircle, FiMoon, FiSun, FiVolume2, FiVolumeX } from "react-icons/fi";
import { toggleDarkMode } from "@/utils/darkmode";
import { useSound } from "@/hooks/useSound";
import Modal from "@/components/ui/Modal";

export default function Header() {
  const { enabled, toggle } = useSound();
  const [help, setHelp] = useState(false);

  return (
    <>
      <a href="#main" className="sr-only z-50 rounded-lg bg-blue-600 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:px-4 focus:py-3">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-line/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <a href="#" aria-label="Gacha home" className="flex shrink-0 items-center gap-3">
            <Image src="/img/logo_gacha.webp" alt="" width={38} height={38} priority className="shrink-0 rounded-[9px] object-contain" />
            <span className="text-[22px] font-extrabold tracking-[-1px]">gacha<span className="text-blue-600">.</span></span>
          </a>
          <nav aria-label="Main navigation" className="hidden items-center gap-8 text-[13px] font-medium md:flex">
            <a href="#studio" className="flex items-center gap-2 text-foreground transition hover:text-accent"><span className="size-1.5 rounded-full bg-blue-500" />Studio</a>
            <a href="#collection" className="text-muted transition hover:text-foreground">Collection</a>
            <button onClick={() => setHelp(true)} className="text-muted transition hover:text-foreground">How it works <FiArrowUpRight className="ml-1 inline" /></button>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={toggle} aria-label={enabled ? "Mute sound" : "Enable sound"} aria-pressed={enabled} title={enabled ? "Sound on" : "Sound off"} className="flex size-10 items-center justify-center rounded-xl text-secondary transition hover:bg-elevated hover:text-accent">{enabled ? <FiVolume2 size={18} /> : <FiVolumeX size={18} />}</button>
            <button onClick={toggleDarkMode} aria-label="Toggle light or dark theme" title="Toggle theme" className="flex size-10 items-center justify-center rounded-xl text-secondary transition hover:bg-elevated hover:text-accent"><FiSun size={18} className="light:hidden" /><FiMoon size={18} className="hidden light:block" /></button>
            <button onClick={() => setHelp(true)} aria-label="How it works" className="flex size-10 items-center justify-center rounded-xl text-secondary hover:bg-elevated md:hidden"><FiHelpCircle size={18} /></button>
          </div>
        </div>
      </header>
      {help && <Modal title="How it works" onClose={() => setHelp(false)}>
        <div className="space-y-6">
          {[["01", "Configure categories", "Create categories and add options, or choose a preset. Enable the categories to include in the draw."], ["02", "Run a draw", "Select Start gacha to draw one option from each active category. Options within each category have equal odds."], ["03", "Review results", "Reveal cards individually or in sequence. Copy the combination or save it to your collection."]].map(([number, title, description]) => <div key={number} className="flex gap-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-accent">{number}</span><div><h3 className="mb-1 text-sm font-semibold">{title}</h3><p className="text-sm leading-relaxed text-secondary">{description}</p></div></div>)}
          <p className="rounded-xl border border-line bg-elevated/50 p-4 text-xs leading-relaxed text-muted">Rarity is visual only and does not affect selection odds. Categories and saved results are stored in this browser. Use the header controls to change the theme or mute sound.</p>
          <button onClick={() => setHelp(false)} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Close</button>
        </div>
      </Modal>}
    </>
  );
}