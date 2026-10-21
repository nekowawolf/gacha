"use client";

import { useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { FiArrowDownRight, FiArrowRight, FiBox, FiCheck, FiCode, FiCoffee, FiFilm, FiGrid, FiLayers, FiMonitor, FiShuffle, FiSliders, FiZap } from "react-icons/fi";
import { TbDeviceGamepad2, TbSparkles } from "react-icons/tb";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryEditor from "@/components/gacha/CategoryEditor";
import GachaArea from "@/components/gacha/GachaArea";
import SavedResults from "@/components/gacha/SavedResults";
import Modal from "@/components/ui/Modal";
import { useGacha } from "@/hooks/useGacha";
import { useSound } from "@/hooks/useSound";
import { activeCategories, combinationCount, presets, type PresetId } from "@/lib/gacha";

const presetIcons = { website: FiMonitor, game: TbDeviceGamepad2, content: FiFilm, daily: FiCoffee };

export default function HomePage() {
  const { categories, applyPreset } = useGacha();
  const { play } = useSound();
  const [pendingPreset, setPendingPreset] = useState<PresetId | null>(null);
  const [mobileTab, setMobileTab] = useState<"stage" | "options">("stage");
  const active = activeCategories(categories);
  const combinations = combinationCount(categories);
  const optionCount = active.reduce((total, category) => total + category.items.filter((item) => item.value.trim()).length, 0);
  const selectedPreset = presets.find((preset) => categories.length === preset.categories.length && categories.every((category, index) => category.id === `${preset.id}-${index}`));

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip">
        <Header />
        <main id="main" className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <section className="relative flex flex-col justify-between gap-9 py-10 sm:py-14 lg:flex-row lg:items-center lg:gap-12 lg:py-16">
            <div className="pointer-events-none absolute -top-24 right-0 -z-10 size-[420px] rounded-full bg-blue-500/4 blur-[100px]" />
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/7 px-3 py-1.5 text-[9px] font-semibold tracking-[0.17em] text-accent"><TbSparkles size={13} /> RANDOM SELECTION TOOL</div>
              <h1 className="text-[38px] leading-[1.15] font-semibold tracking-[-1.8px] sm:text-[52px] sm:tracking-[-2.5px] xl:text-[58px]">Random selection<br /><span className="text-blue-600">with custom options.</span><span className="ml-2 inline-block align-top text-2xl text-blue-600 sm:ml-3 sm:text-4xl">✦</span></h1>
              <p className="mt-5 max-w-lg text-[13px] leading-7 text-secondary">Create categories, add options, and generate random combinations.<br className="hidden sm:block" /> Save results locally or export your collection.</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-muted"><span className="flex items-center gap-1.5"><FiCode size={12} />Custom categories</span><span className="flex items-center gap-1.5"><FiSliders size={12} />Editable options</span><span className="flex items-center gap-1.5"><FiZap size={12} />Random draws</span></div>
            </motion.div>
            <dl aria-label="Studio statistics" className="grid grid-cols-2 gap-3 sm:max-w-lg lg:w-[340px] lg:shrink-0 xl:w-[370px]">
              {[
                { label: "Active categories", value: active.length.toLocaleString("en-US"), Icon: FiLayers },
                { label: "Available options", value: optionCount.toLocaleString("en-US"), Icon: FiGrid },
              ].map(({ label, value, Icon }) => <div key={label} className="group relative min-w-0 overflow-hidden rounded-2xl border border-line bg-linear-to-br from-surface to-elevated/50 p-4 shadow-sm transition-colors hover:border-blue-500/35 sm:p-5"><div aria-hidden="true" className="mb-5 flex size-9 items-center justify-center rounded-xl border border-line bg-background/60 text-accent transition-transform motion-safe:group-hover:-translate-y-0.5"><Icon size={16} /></div><dt className="text-[10px] font-medium text-secondary sm:text-[11px]">{label}</dt><dd title={value} className="mt-2 truncate text-[32px] leading-none font-semibold tracking-[-1.5px] tabular-nums sm:text-4xl">{value}</dd><div aria-hidden="true" className="absolute top-5 right-5 size-1.5 rounded-full bg-accent/40" /></div>)}
              <div className="relative col-span-2 flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-blue-500/30 bg-linear-to-br from-blue-500/15 via-surface to-surface p-5 shadow-sm">
                <div aria-hidden="true" className="pointer-events-none absolute -right-5 -bottom-12 size-40 rounded-full border border-accent/10 before:absolute before:inset-5 before:rounded-full before:border before:border-accent/10" />
                <div className="relative min-w-0"><dt className="flex items-center gap-2 text-[11px] font-medium text-accent"><TbSparkles size={14} />Possible combinations</dt><dd title={combinations.toLocaleString("en-US")} className="mt-2 truncate text-[38px] leading-none font-semibold tracking-[-1.5px] tabular-nums sm:text-[42px]">{combinations > 999999 ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(combinations) : combinations.toLocaleString("en-US")}</dd></div>
                <div aria-hidden="true" className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-accent"><FiArrowDownRight size={23} /></div>
              </div>
            </dl>
          </section>

          <section id="studio" aria-label="Gacha studio">
            <div className="mb-5 flex flex-col justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2"><span className="mr-2 text-[11px] text-muted">Start with a preset</span>{presets.map((preset) => { const Icon = presetIcons[preset.id]; const selected = selectedPreset?.id === preset.id; return <button key={preset.id} title={preset.description} onClick={() => { if (categories.length) setPendingPreset(preset.id); else { applyPreset(preset.id); play("click"); } }} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-medium transition ${selected ? "border-blue-500/30 bg-blue-500/10 text-accent" : "border-line bg-surface/70 text-secondary hover:border-blue-400/40 hover:text-accent"}`}><Icon size={14} />{preset.name}</button>; })}</div>
              <span className="flex items-center gap-1.5 text-[10px] text-muted"><FiCheck size={12} className="text-emerald-400" />No account required</span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1 lg:hidden" role="tablist" aria-label="Studio view" onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === "Home" ? "stage" : event.key === "End" ? "options" : mobileTab === "stage" ? "options" : "stage";
              setMobileTab(next);
              document.getElementById(`${next}-tab`)?.focus();
            }}>
              <button id="stage-tab" role="tab" tabIndex={mobileTab === "stage" ? 0 : -1} aria-selected={mobileTab === "stage"} aria-controls="stage-panel" onClick={() => setMobileTab("stage")} className={`flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-medium transition ${mobileTab === "stage" ? "bg-elevated text-foreground shadow-sm" : "text-muted"}`}><FiShuffle size={14} />Gacha draw</button>
              <button id="options-tab" role="tab" tabIndex={mobileTab === "options" ? 0 : -1} aria-selected={mobileTab === "options"} aria-controls="options-panel" onClick={() => setMobileTab("options")} className={`flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-medium transition ${mobileTab === "options" ? "bg-elevated text-foreground shadow-sm" : "text-muted"}`}><FiSliders size={14} />Edit options<span className="rounded bg-background/50 px-1.5 py-0.5 text-[9px]">{categories.length}</span></button>
            </div>
            <div className="grid items-stretch gap-5 lg:grid-cols-[310px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)]">
              <div id="options-panel" role="tabpanel" aria-labelledby="options-tab" className={`min-w-0 ${mobileTab === "options" ? "block" : "hidden lg:block"}`}><CategoryEditor /><button onClick={() => setMobileTab("stage")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white lg:hidden">Go to draw<FiArrowRight /></button></div>
              <div id="stage-panel" role="tabpanel" aria-labelledby="stage-tab" className={`min-w-0 [&>section]:h-full ${mobileTab === "stage" ? "block" : "hidden lg:block"}`}><GachaArea /></div>
            </div>

            <div className="mt-5 grid gap-4 rounded-xl border border-line/70 bg-surface/40 px-5 py-4 sm:grid-cols-3 sm:gap-7 sm:px-6">
              {[
                { step: "01", Icon: FiSliders, title: "Configure categories", description: "Add options or use a preset." },
                { step: "02", Icon: FiShuffle, title: "Run a draw", description: "Select one option per active category." },
                { step: "03", Icon: FiBox, title: "Review results", description: "Reveal, copy, or save the combination." },
              ].map(({ step, Icon, title, description }) => <div key={step} className="flex items-center gap-3"><span className="text-[10px] font-medium tabular-nums text-muted/60">{step}</span><div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-secondary"><Icon size={14} /></div><div><h3 className="text-[11px] font-medium">{title}</h3><p className="mt-1 text-[10px] leading-relaxed text-muted">{description}</p></div></div>)}
            </div>
          </section>
          <SavedResults />
        </main>
        <Footer />
      </div>
      {pendingPreset && <Modal title={`Use the ${presets.find((preset) => preset.id === pendingPreset)?.name} preset?`} onClose={() => setPendingPreset(null)}><p className="text-sm leading-7 text-secondary">This replaces your current categories and options. Saved combinations are not affected.</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setPendingPreset(null)} className="rounded-xl border border-line px-4 py-2.5 text-sm hover:bg-elevated">Cancel</button><button onClick={() => { applyPreset(pendingPreset); setPendingPreset(null); play("click"); }} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">Use preset</button></div></Modal>}
    </MotionConfig>
  );
}