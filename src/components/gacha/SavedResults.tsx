"use client";

import { useCallback, useState } from "react";
import { FiArrowDown, FiBookmark, FiCheck, FiClock, FiCopy, FiDownload, FiSearch, FiTrash2 } from "react-icons/fi";
import { useGacha, type SavedResult } from "@/hooks/useGacha";
import { formatResults, getPalette } from "@/lib/gacha";
import Modal from "@/components/ui/Modal";
import Toast, { type ToastType } from "@/components/ui/Toast";

export default function SavedResults() {
  const { savedResults, removeResult } = useGacha();
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(6);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string; type: ToastType } | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const showToast = (message: string, type: ToastType) => setToast((previous) => ({ id: (previous?.id ?? 0) + 1, message, type }));
  const [deleting, setDeleting] = useState<SavedResult | null>(null);
  const matches = savedResults.filter((result) => formatResults(result.items).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  const copy = async (result: SavedResult) => {
    try { await navigator.clipboard.writeText(formatResults(result.items)); setCopied(result.id); showToast("Combination copied.", "success"); }
    catch { showToast("Unable to copy. Select the result text or export your collection.", "error"); }
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(savedResults, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `gacha-collection-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section id="collection" aria-labelledby="collection-heading" className="mt-12 sm:mt-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div><div className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-muted"><FiBookmark size={13} />SAVED RESULTS</div><h2 id="collection-heading" className="flex items-center gap-3 text-xl font-semibold tracking-tight">Collection<span className="rounded-lg border border-line bg-surface px-2 py-0.5 text-xs font-medium tabular-nums text-muted">{savedResults.length}</span></h2><p className="mt-2 text-xs leading-relaxed text-secondary">Browse, copy, or export your saved combinations.</p></div>
        {savedResults.length > 0 && <div className="flex w-full gap-2 sm:w-auto"><div className="relative min-w-0 flex-1"><FiSearch className="absolute left-3 top-3 text-muted" size={14} /><input aria-label="Search collection" placeholder="Search combinations..." value={query} onChange={(event) => { setQuery(event.target.value); setLimit(6); }} className="w-full rounded-lg border border-line bg-surface py-2.5 pr-3 pl-9 text-xs sm:w-48" /></div><button onClick={download} aria-label="Export collection as JSON" title="Export collection as JSON" className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-secondary transition hover:text-accent"><FiDownload size={16} /></button></div>}
      </div>
      {savedResults.length === 0 ? <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/40 px-6 py-12 text-center"><div className="mb-4 flex size-12 -rotate-6 items-center justify-center rounded-2xl border border-line bg-elevated/70 text-muted"><FiBookmark size={21} /></div><h3 className="text-sm font-medium text-secondary">No saved combinations</h3><p className="mt-2 max-w-sm text-xs leading-6 text-muted">Complete a draw, then select <span className="text-secondary">Save combination</span> to add it to your collection.</p></div> : <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.slice(0, limit).map((result) => <article key={result.id} className="flex min-w-0 flex-col rounded-2xl border border-line bg-surface p-5 transition hover:border-blue-500/30">
            <div className="mb-5 flex items-center justify-between"><span className="flex items-center gap-2 text-[10px] leading-none tracking-wider text-muted"><span aria-hidden="true" className="size-1.5 shrink-0 -translate-y-px rounded-full bg-blue-400" /><span>SAVED COMBINATION</span></span><div className="flex gap-1"><button onClick={() => copy(result)} aria-label="Copy saved combination" className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-elevated hover:text-accent">{copied === result.id ? <FiCheck size={14} className="text-emerald-400" /> : <FiCopy size={14} />}</button><button onClick={() => setDeleting(result)} aria-label="Delete saved combination" className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-400"><FiTrash2 size={14} /></button></div></div>
            <dl className="mb-5 flex-1 space-y-3.5">{result.items.map((item, index) => { const palette = getPalette(item.itemValue); return <div key={index} className="flex items-start justify-between gap-5"><dt className="max-w-[40%] text-[11px] leading-5 break-words text-muted">{item.categoryName}</dt><dd className="min-w-0 text-right text-xs leading-5 font-medium break-words text-foreground">{palette.length ? item.itemValue.split(" · ")[0] : item.itemValue}{palette.length > 0 && <span className="mt-1 flex justify-end gap-1">{palette.map((color, i) => <span key={i} title={color} className="size-3 rounded-full border border-line" style={{ backgroundColor: color }} />)}</span>}</dd></div>; })}</dl>
            <div className="flex items-center gap-1.5 border-t border-line pt-4 text-[10px] text-muted"><FiClock size={11} /><time dateTime={new Date(result.timestamp).toISOString()}>{new Date(result.timestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</time></div>
          </article>)}
        </div>
        {matches.length === 0 && <p className="rounded-xl border border-dashed border-line py-12 text-center text-sm text-muted">No matching combinations. Try another keyword.</p>}
        {matches.length > limit && <button onClick={() => setLimit((previous) => previous + 6)} className="mx-auto mt-5 flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-xs text-secondary hover:bg-elevated">Show more<FiArrowDown /></button>}
      </>}
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={dismissToast} />}
      {deleting && <Modal title="Delete this combination?" onClose={() => setDeleting(null)}><p className="text-sm leading-relaxed text-secondary">This removes the saved combination. Categories and options are not affected.</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setDeleting(null)} className="rounded-xl border border-line px-4 py-2.5 text-sm">Cancel</button><button onClick={() => { removeResult(deleting.id); setDeleting(null); showToast("Combination deleted.", "success"); }} className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600">Delete combination</button></div></Modal>}
    </section>
  );
}