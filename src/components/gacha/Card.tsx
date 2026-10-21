"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { FiArrowUpRight, FiStar } from "react-icons/fi";
import { getPalette, type GachaResultItem, type Rarity } from "@/lib/gacha";

const rarityStyles: Record<Rarity, { border: string; text: string; glow: string; gradient: string }> = {
  normal: { border: "border-slate-400/50", text: "text-slate-300 light:text-slate-600", glow: "bg-slate-400", gradient: "from-slate-600/30 light:from-slate-400/15" },
  common: { border: "border-slate-400/50", text: "text-slate-300 light:text-slate-600", glow: "bg-slate-400", gradient: "from-slate-600/30 light:from-slate-400/15" },
  uncommon: { border: "border-emerald-400/60", text: "text-emerald-300 light:text-emerald-700", glow: "bg-emerald-400", gradient: "from-emerald-600/25 light:from-emerald-400/15" },
  rare: { border: "border-cyan-300/80 light:border-cyan-600/60", text: "text-cyan-200 light:text-cyan-800", glow: "bg-cyan-300", gradient: "from-cyan-500/35 via-teal-500/10 light:from-cyan-300/30 light:via-teal-200/15" },
  epic: { border: "border-violet-400/70", text: "text-violet-300 light:text-violet-700", glow: "bg-violet-400", gradient: "from-violet-600/30 light:from-violet-400/15" },
  legendary: { border: "border-amber-300/80", text: "text-amber-200 light:text-amber-800", glow: "bg-amber-300", gradient: "from-amber-500/30 light:from-amber-300/20" },
  mythic: { border: "border-rose-400/80", text: "text-rose-300 light:text-rose-700", glow: "bg-rose-400", gradient: "from-rose-600/30 light:from-rose-400/15" },
};

export function CardBack({ index = 0 }: { index?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit] border border-blue-400/35 bg-linear-to-br from-[#182e51] via-[#101c32] to-[#101828] shadow-[inset_0_0_30px_#3b82f612] light:from-blue-50 light:via-white light:to-blue-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#2563eb18,transparent_70%)]" />
      <div className="absolute inset-x-0 inset-y-5"><Image src="/img/gacha_line.webp" alt="" fill sizes="240px" className="object-cover opacity-90" priority /></div>
      <div className="absolute inset-x-3 top-3 flex items-center justify-between text-[7px] font-semibold tracking-[0.2em] text-blue-200/60 light:text-blue-800/75"><span>GACHA STUDIO</span><span>{String(index + 1).padStart(2, "0")}</span></div>
      <div className="absolute inset-x-0 bottom-3 text-center text-[7px] tracking-[0.2em] text-blue-200/50 light:text-blue-800/65">RANDOM SELECTION</div>
      <div className="absolute inset-0 bg-linear-to-br from-white/5 via-transparent to-transparent" />
    </div>
  );
}

export default function Card({ result, index, revealed, charging, disabled, onReveal }: { result: GachaResultItem; index: number; revealed: boolean; charging: boolean; disabled: boolean; onReveal: () => void }) {
  const reduced = useReducedMotion();
  const rarity = result.rarity ?? "rare";
  const style = rarityStyles[rarity];
  const palette = getPalette(result.itemValue);
  const title = palette.length ? result.itemValue.split(" · ")[0] : result.itemValue;

  return (
    <motion.div initial={reduced ? false : { opacity: 0, y: 24, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: reduced ? 0 : index * 0.09, duration: 0.4 }} className="relative min-w-0">
      {revealed && !reduced && <>
        <motion.div initial={{ opacity: 0.7, scale: 0.7 }} animate={{ opacity: 0, scale: 1.8 }} transition={{ duration: 0.8 }} className={`pointer-events-none absolute inset-3 rounded-full blur-2xl ${style.glow}`} />
        {Array.from({ length: 12 }, (_, i) => <motion.span key={i} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos(i * Math.PI / 6) * 110, y: Math.sin(i * Math.PI / 6) * 145, opacity: 0, scale: 0 }} transition={{ duration: 0.85, delay: 0.12 }} className={`pointer-events-none absolute left-1/2 top-1/2 z-10 size-1 rounded-full ${style.glow}`} />)}
      </>}
      <motion.button
        onClick={onReveal} disabled={disabled || revealed} aria-label={revealed ? `${result.categoryName}: ${result.itemValue}, ${rarity}` : `Reveal ${result.categoryName} card`} aria-pressed={revealed}
        whileHover={!disabled && !revealed && !reduced ? { y: -7 } : undefined}
        animate={charging && !reduced ? { x: [0, -2, 3, -3, 2, 0], scale: 1.04 } : { x: 0, scale: 1 }} transition={{ duration: 0.35 }}
        className="relative block aspect-[2/3] w-full rounded-xl text-left outline-offset-8 perspective-[1200px] disabled:cursor-default"
      >
        <motion.div animate={{ rotateY: revealed ? 180 : 0 }} transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 rounded-xl transform-3d">
          <div aria-hidden="true" className="absolute inset-0 rounded-xl backface-hidden"><CardBack index={index} />{charging && <motion.div initial={{ opacity: 0 }} animate={{ opacity: reduced ? 0.25 : [0, 0.25, 0.65] }} transition={{ duration: 0.5 }} className="absolute inset-0 rounded-xl bg-blue-200 mix-blend-screen" />}</div>
          <div aria-hidden={!revealed} className={`absolute inset-0 flex rotate-y-180 flex-col overflow-hidden rounded-xl border bg-surface bg-linear-to-b ${style.gradient} to-transparent p-3 backface-hidden sm:p-4 ${style.border}`}>
            {revealed && <>
              <div className={`flex items-center justify-between gap-1 text-[8px] font-semibold uppercase tracking-wider ${style.text}`}><span className="truncate">{result.categoryName}</span><FiArrowUpRight size={13} className="shrink-0" /></div>
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 py-3 text-center">
                <div className={`flex size-9 items-center justify-center rounded-full border border-current/20 ${style.text}`}><FiStar size={18} /></div>
                <h3 className="max-h-[110px] w-full overflow-y-auto text-base leading-snug font-bold break-words text-foreground sm:text-lg">{title}</h3>
                {palette.length > 0 && <div className="flex overflow-hidden rounded-full border border-line">{palette.map((color, i) => <span key={`${color}-${i}`} title={color} className="size-6" style={{ backgroundColor: color }} />)}</div>}
              </div>
              <div className={`flex items-center justify-center gap-1.5 border-t border-line pt-3 text-[8px] font-semibold uppercase tracking-[0.18em] ${style.text}`}><FiStar size={10} />{rarity}<FiStar size={10} /></div>
              {!reduced && <motion.div initial={{ x: "-180%" }} animate={{ x: "280%" }} transition={{ delay: 0.25, duration: 0.85 }} className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/15 to-transparent" />}
            </>}
          </div>
        </motion.div>
      </motion.button>
      <p className="mt-3 truncate text-center text-[10px] text-secondary">{result.categoryName}</p>
    </motion.div>
  );
}