"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiCheck, FiChevronDown, FiGrid, FiPlus, FiSliders, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { useGacha, type GachaCategory } from "@/hooks/useGacha";
import { activeCategories } from "@/lib/gacha";
import Modal from "@/components/ui/Modal";
import CategoryImport from "@/components/gacha/CategoryImport";

function CategoryRow({ category, index }: { category: GachaCategory; index: number }) {
  const { updateCategory, toggleCategory, removeCategory, addItem, removeItem, updateItem } = useGacha();
  const [open, setOpen] = useState(index === 0);
  const [option, setOption] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const enabled = category.enabled !== false;
  const count = category.items.filter((item) => item.value.trim()).length;

  return (
    <div className={`overflow-hidden rounded-xl border transition-colors ${open ? "border-blue-500/35 bg-blue-500/3" : "border-line bg-background/30"}`}>
      <div className="flex items-center gap-3 px-3.5 py-3">
        <button onClick={() => toggleCategory(category.id)} role="switch" aria-checked={enabled} aria-label={`Enable category ${category.name}`} className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition ${enabled ? "border-blue-500/35 bg-blue-500/15 text-accent" : "border-line bg-elevated text-muted"}`}>{enabled ? <FiCheck size={15} /> : <FiGrid size={14} />}</button>
        <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`category-${category.id}`} className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left">
          <span className={`min-w-0 flex-1 truncate text-[13px] font-semibold ${enabled ? "text-foreground" : "text-muted"}`}>{category.name || "Untitled"}</span>
          <span className="shrink-0 rounded-md bg-elevated px-1.5 py-0.5 text-[10px] tabular-nums text-secondary">{count}</span>
          <FiChevronDown size={14} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open ? <div id={`category-${category.id}`} className="border-t border-line/70 px-3.5 pb-3.5 pt-3">
        <div className="mb-3 flex items-center gap-2">
          <input aria-label={`Category name ${index + 1}`} value={category.name} maxLength={60} onChange={(event) => updateCategory(category.id, event.target.value)} className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 py-2 text-xs text-secondary transition hover:border-line focus:border-blue-500 focus:outline-none" />
          <button onClick={() => setConfirmDelete(true)} aria-label={`Delete category ${category.name}`} className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-400"><FiTrash2 size={13} /></button>
        </div>
        <div className="space-y-1.5">
          {category.items.map((item, i) => <div key={item.id} className="group flex items-center gap-1 rounded-lg border border-line/70 bg-surface">
            <span className="pl-2.5 text-[10px] tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
            <input aria-label={`Option ${i + 1} in ${category.name}`} value={item.value} maxLength={160} onChange={(event) => updateItem(category.id, item.id, event.target.value)} className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-2 text-xs text-secondary focus:text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <button onClick={() => removeItem(category.id, item.id)} aria-label={`Delete option ${item.value}`} className="flex size-8 shrink-0 items-center justify-center text-muted transition hover:text-red-400"><FiX size={13} /></button>
          </div>)}
          {count === 0 && <p className="py-3 text-xs leading-relaxed text-muted">No options yet. Add one to include this category in your draw.</p>}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); if (option.trim()) { addItem(category.id, option); setOption(""); } }} className="mt-3 flex items-center gap-2">
          <input aria-label={`New option for ${category.name}`} placeholder="Add an option..." value={option} maxLength={160} onChange={(event) => setOption(event.target.value)} className="w-0 min-w-0 flex-1 rounded-lg border border-dashed border-line bg-transparent px-3 py-2.5 text-xs placeholder:text-muted focus:border-blue-500 focus:outline-none" />
          <button type="submit" disabled={!option.trim()} aria-label={`Add option to ${category.name}`} className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-accent transition hover:bg-blue-500/25 disabled:opacity-30"><FiPlus size={16} /></button>
        </form>
        <p className="mt-2.5 text-[10px] text-muted">{count ? `Probability per option: ${(100 / count).toLocaleString("en-US", { maximumFractionDigits: 1 })}%` : "Empty options are excluded from the draw."}</p>
      </div> : <div id={`category-${category.id}`} className="-mt-1 truncate px-3.5 pb-3 pl-[58px] text-[11px] text-muted">{category.items.slice(0, 3).map((item) => item.value.split(" · ")[0]).join(" · ") || "No options added"}</div>}
      {confirmDelete && <Modal title={`Delete ${category.name || "this category"}?`} onClose={() => setConfirmDelete(false)}><p className="text-sm leading-relaxed text-secondary">This deletes the category and all its options. Saved combinations are not affected.</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setConfirmDelete(false)} className="rounded-xl border border-line px-4 py-2.5 text-sm">Cancel</button><button onClick={() => removeCategory(category.id)} className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600">Delete category</button></div></Modal>}
    </div>
  );
}

export default function CategoryEditor() {
  const { categories, addCategory, clearCategories, persistent } = useGacha();
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [name, setName] = useState("");

  return (
    <aside aria-labelledby="pool-heading" className="flex h-[min(700px,calc(100dvh-7rem))] min-h-[360px] min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface lg:sticky lg:top-24">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-5 sm:px-5">
        <div className="flex items-center gap-2.5"><FiSliders size={16} className="shrink-0 text-accent" /><h2 id="pool-heading" className="text-sm font-semibold">Categories</h2></div>
        <span className="shrink-0 rounded-full border border-blue-500/20 bg-blue-500/8 px-2 py-1 text-[10px] tabular-nums text-accent">{activeCategories(categories).length} active</span>
        {categories.length > 0 && <button type="button" onClick={() => setConfirmClear(true)} className="flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] text-muted transition hover:bg-red-500/10 hover:text-red-400 light:hover:text-red-600"><FiTrash2 size={12} />Clear all</button>}
      </div>
      <div role="region" aria-label="Category list" tabIndex={0} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 focus-visible:-outline-offset-2">
        {categories.map((category, index) => <CategoryRow key={category.id} category={category} index={index} />)}
        {!categories.length && <div className="py-8 text-center"><FiGrid className="mx-auto mb-3 text-2xl text-muted" /><p className="text-sm text-secondary">No categories added</p><p className="mt-1 text-xs text-muted">Add a category, import JSON, or choose a preset.</p></div>}
      </div>
      <div className="shrink-0 space-y-3 border-t border-line bg-surface p-4">
        <button onClick={() => setImporting(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-elevated py-3 text-xs font-medium text-secondary transition hover:border-blue-500/40 hover:text-accent"><FiUpload size={15} />Import JSON</button>
        <button onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-500/35 bg-blue-500/5 py-3.5 text-xs font-medium text-accent transition hover:border-blue-500/60 hover:bg-blue-500/10"><FiPlus size={15} />Add category</button>
        <div className="flex items-start gap-2 px-1 text-[10px] leading-relaxed text-muted"><span className={`mt-1 size-1.5 shrink-0 rounded-full ${persistent ? "bg-emerald-400" : "bg-amber-400"}`} /><p>{persistent ? "Automatically saved in this browser." : "Browser storage is unavailable. Copy your results before closing this page."}</p></div>
      </div>
      {adding && <Modal title="New category" onClose={() => setAdding(false)}><form onSubmit={(event) => { event.preventDefault(); if (name.trim()) { addCategory(name); setName(""); setAdding(false); } }}><label htmlFor="category-name" className="text-sm text-secondary">Category name</label><input id="category-name" autoFocus maxLength={60} required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Framework, Activity, Location" className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" /><p className="mt-3 text-xs leading-relaxed text-muted">Create the category, then add options to include in the draw.</p><button disabled={!name.trim()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-40"><FiPlus />Create category</button></form></Modal>}
      {importing && <CategoryImport onClose={() => setImporting(false)} onImported={(count) => { setImporting(false); toast.success(`${count} ${count === 1 ? "category" : "categories"} imported successfully.`); }} />}
      {confirmClear && <Modal title="Clear all categories?" onClose={() => setConfirmClear(false)}>
        <p className="text-sm leading-7 text-secondary">This removes all categories and their options from this browser. Your current draw and saved combinations are not affected.</p>
        <p className="mt-3 text-xs leading-relaxed text-red-400 light:text-red-600">This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setConfirmClear(false)} className="rounded-xl border border-line px-4 py-2.5 text-sm hover:bg-elevated">Cancel</button>
          <button type="button" onClick={() => {
            const persisted = clearCategories();
            setConfirmClear(false);
            if (persisted) toast.success("All categories cleared. Saved combinations are unchanged.");
            else toast.warning("Categories cleared for this page, but browser storage could not be updated. Previous categories may return after reloading.");
          }} className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600">Clear all</button>
        </div>
      </Modal>}
    </aside>
  );
}