"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiBookmark, FiCheck, FiCopy, FiLayers, FiRotateCw, FiShuffle, FiSkipForward, FiZap } from "react-icons/fi";
import { useGacha } from "@/hooks/useGacha";
import { useSound } from "@/hooks/useSound";
import { activeCategories, drawResults, formatResults, type GachaResultItem } from "@/lib/gacha";
import Card, { CardBack } from "./Card";
import Toast from "@/components/ui/Toast";

type Phase = "idle" | "shuffling" | "ready" | "complete";

export default function GachaArea() {
  const { categories, saveResult } = useGacha();
  const { play, stop } = useSound();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<GachaResultItem[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [charging, setCharging] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lock = useRef(false);
  const opened = useRef(new Set<number>());
  const resultRefs = useRef<(HTMLDivElement | null)[]>([]);
  const active = activeCategories(categories);

  useEffect(() => () => { timers.current.forEach(clearTimeout); stop(); }, [stop]);
  const schedule = (callback: () => void, delay: number) => { timers.current.push(setTimeout(callback, delay)); };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const pull = () => {
    if (lock.current) return;
    if (!active.length) {
      setToast((previous) => ({ id: (previous?.id ?? 0) + 1, message: "Add options or choose a preset." }));
      return;
    }
    dismissToast();
    clearTimers();
    stop();
    lock.current = true;
    opened.current = new Set();
    setRevealed([]);
    setSaved(false);
    setMessage("");
    setCharging(null);
    setBusy(true);
    setResults(drawResults(categories));
    setPhase("shuffling");
    play("shuffle");
    schedule(() => { setPhase("ready"); setBusy(false); lock.current = false; }, reduced ? 100 : 1100);
  };

  const revealOne = (index: number, next?: () => void) => {
    const element = resultRefs.current[index];
    if (element && element.offsetParent !== null) {
      const box = element.getBoundingClientRect();
      if (box.top < 90 || box.bottom > window.innerHeight - 30) element.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "center" });
    }
    setCharging(index);
    play("charge");
    schedule(() => {
      setCharging(null);
      opened.current.add(index);
      setRevealed([...opened.current]);
      play("reveal", ["legendary", "mythic"].includes(results[index].rarity ?? ""));
      schedule(() => {
        if (opened.current.size === results.length) {
          setPhase("complete"); setBusy(false); lock.current = false;
        } else if (next) next();
        else { setBusy(false); lock.current = false; }
      }, reduced ? 50 : 850);
    }, reduced ? 50 : 550);
  };

  const reveal = (index: number) => {
    if (lock.current || opened.current.has(index) || phase !== "ready") return;
    lock.current = true; setBusy(true); revealOne(index);
  };

  const revealAll = () => {
    if (lock.current || phase !== "ready") return;
    lock.current = true; setBusy(true);
    const remaining = results.map((_, index) => index).filter((index) => !opened.current.has(index));
    const step = (position: number) => revealOne(remaining[position], position < remaining.length - 1 ? () => step(position + 1) : undefined);
    if (remaining.length) step(0);
  };

  const skip = () => {
    clearTimers(); stop();
    opened.current = new Set(results.map((_, index) => index));
    setRevealed([...opened.current]); setCharging(null); setBusy(false); setPhase("complete"); lock.current = false;
    play("reveal");
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(formatResults(results)); setMessage("Combination copied."); play("click"); }
    catch { setMessage("Unable to copy. Select the result text to copy it manually."); }
  };

  return (
    <section aria-labelledby="stage-heading" className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface text-foreground">
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-line/70 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-2.5"><span className="relative flex size-2"><span className="absolute inline-flex size-full rounded-full bg-blue-400/30 motion-safe:animate-ping" /><span className="relative size-2 rounded-full bg-blue-400" /></span><h2 id="stage-heading" className="text-sm font-medium">Gacha draw</h2></div>
        <span className="hidden text-[10px] tracking-wider text-muted sm:block">RANDOM SELECTION</span>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#1b397144,transparent_65%)] light:bg-[radial-gradient(ellipse_at_50%_35%,#93c5fd33,transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#6682b51c_1px,transparent_1px)] bg-size-[22px_22px] [mask-image:linear-gradient(transparent,black_30%,black_70%,transparent)]" />

      <div className="relative flex min-h-[540px] flex-1 flex-col items-center justify-center px-5 py-8 sm:min-h-[580px] sm:px-8">
        <AnimatePresence mode="wait">
          {(phase === "idle" || phase === "shuffling") ? (
            <motion.div key="intro" exit={{ opacity: 0, scale: reduced ? 1 : 0.94 }} transition={{ duration: 0.2 }} className="flex w-full flex-col items-center">
              <div className="mb-2 flex items-center gap-2 text-center text-[8px] leading-5 font-medium tracking-[0.16em] text-accent sm:text-[9px] sm:tracking-[0.22em]"><span className="h-px w-4 shrink-0 bg-blue-400/30 sm:w-6" /> ONE OPTION PER CATEGORY <span className="h-px w-4 shrink-0 bg-blue-400/30 sm:w-6" /></div>
              <div className="relative my-4 h-[260px] w-full max-w-[430px] sm:h-[285px]" aria-hidden="true">
                <div className="absolute left-1/2 top-1/2 h-44 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[55px]" />
                {[-1, 1, 0].map((direction, index) => <motion.div key={direction}
                  initial={{ x: direction * 65, rotate: direction * 15, y: direction === 0 ? 4 : 22, scale: 1 }}
                  animate={phase === "shuffling" && !reduced ? { x: [direction * 65, -direction * 40, direction * 30, 0], rotate: [direction * 15, -direction * 12, direction * 6, 0], y: [direction === 0 ? 4 : 22, -12, 8, -8], scale: [1, 0.96, 1.04, 1] } : { x: direction * 65, rotate: direction * 15, y: direction === 0 ? 4 : 22, scale: 1 }}
                  transition={{ duration: reduced ? 0 : 0.95, ease: "easeInOut" }}
                  className={`absolute left-1/2 top-4 h-[228px] w-[155px] -translate-x-1/2 rounded-xl shadow-[0_18px_50px_#0008] light:shadow-[0_18px_40px_#1e40af20] sm:h-[250px] sm:w-[170px] ${direction === 0 ? "z-10" : "opacity-75"}`}
                ><CardBack index={index} /></motion.div>)}
                <span className="absolute left-[12%] top-8 text-lg text-blue-400/40">✦</span><span className="absolute right-[12%] bottom-8 text-2xl text-blue-300/60">✦</span><span className="absolute right-[17%] top-0 text-xs text-blue-300/30">+</span>
              </div>
              <h3 className="text-center text-2xl font-semibold tracking-tight sm:text-[27px]">{phase === "shuffling" ? "Preparing results..." : "Generate a combination"}</h3>
              <p className="mt-2 max-w-sm text-center text-xs leading-6 text-secondary">{phase === "shuffling" ? "Preparing cards for the selected options." : "Draw one random option from each active category."}</p>
              <motion.button tabIndex={0} whileHover={!reduced && !busy ? { scale: 1.025 } : undefined} whileTap={!reduced ? { scale: 0.97 } : undefined} onClick={pull} disabled={busy} className="group mt-6 flex min-w-[215px] items-center justify-center gap-3 rounded-xl border border-blue-400/40 bg-linear-to-b from-blue-500 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_4px_24px_#2563eb40,inset_0_1px_0_#ffffff30] transition hover:from-blue-400 hover:to-blue-500 disabled:opacity-45">
                <FiShuffle size={17} className={busy ? "motion-safe:animate-pulse" : ""} />{busy ? "Shuffling..." : "Start gacha"}<FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </motion.button>
              <p className="mt-3 text-center text-[10px] leading-relaxed text-muted">{active.length ? `${active.length} active ${active.length === 1 ? "category" : "categories"} · 1 card each` : "Add categories and options, or choose a preset."}</p>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full flex-col items-center">
              <span className="mb-3 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[9px] font-medium tracking-[0.14em] text-accent">{phase === "complete" ? "DRAW COMPLETE" : "CARDS READY"}</span>
              <h3 className="text-center text-xl font-semibold tracking-tight sm:text-2xl">{phase === "complete" ? "Draw results" : "Reveal your cards"}</h3>
              <p className="mt-2 text-center text-xs leading-relaxed text-secondary">{phase === "complete" ? "Save or copy this combination, or run another draw." : "Select a card or reveal all cards in sequence."}</p>
              <div className={`my-8 grid w-full gap-4 ${results.length === 1 ? "max-w-[190px] grid-cols-1" : results.length === 2 ? "max-w-[400px] grid-cols-2" : results.length === 3 ? "max-w-[620px] grid-cols-2 sm:grid-cols-3" : "grid-cols-2 xl:grid-cols-4"}`}>
                {results.map((result, index) => <div key={index} ref={(element) => { resultRefs.current[index] = element; }}><Card result={result} index={index} revealed={revealed.includes(index)} charging={charging === index} disabled={busy} onReveal={() => reveal(index)} /></div>)}
              </div>
              {phase === "ready" ? <div className="flex flex-wrap items-center justify-center gap-3"><button disabled={busy} onClick={revealAll} className="flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/15 px-5 py-3 text-xs font-semibold text-accent transition hover:bg-blue-500/25 disabled:opacity-40"><FiZap size={15} />{busy ? "Revealing cards..." : "Reveal in sequence"}</button><button onClick={skip} className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs text-secondary hover:bg-elevated hover:text-foreground"><FiSkipForward size={14} />Skip animation</button></div> : <div className="flex flex-wrap justify-center gap-2">
                <button disabled={saved} onClick={() => { saveResult(results); setSaved(true); play("save"); }} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:bg-emerald-500/15 disabled:text-emerald-300 light:disabled:text-emerald-700">{saved ? <FiCheck size={15} /> : <FiBookmark size={15} />}{saved ? "Saved to collection" : "Save combination"}</button>
                <button onClick={copy} className="flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-xs text-secondary hover:bg-elevated"><FiCopy size={14} />Copy</button>
                <button onClick={pull} className="flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-xs text-secondary hover:bg-elevated"><FiRotateCw size={14} />Draw again</button>
              </div>}
              <div role="status" aria-live="polite" className="mt-4 text-center text-[11px] leading-relaxed text-secondary">{message || (phase === "complete" ? "Rarity is visual only. Options within each category have equal odds." : `${revealed.length} of ${results.length} cards revealed`)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="relative flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-line/70 px-4 py-4 text-[10px] text-muted"><span className="flex items-center gap-1.5"><FiLayers size={12} />Custom categories</span><span className="flex items-center gap-1.5"><FiShuffle size={12} />Equal odds</span><span className="flex items-center gap-1.5"><FiBookmark size={12} />Save results</span></div>
      {toast && <Toast key={toast.id} message={toast.message} onClose={dismissToast} />}
    </section>
  );
}