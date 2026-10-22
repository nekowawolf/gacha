"use client";

import { useRef, useState } from "react";
import { FiCheck, FiCopy, FiUpload } from "react-icons/fi";
import Modal from "@/components/ui/Modal";
import { useGacha } from "@/hooks/useGacha";
import { CATEGORY_JSON_EXAMPLE, MAX_IMPORT_BYTES, createCategoryPrompt, parseCategoryImport, type ImportedCategory } from "@/lib/categoryImport";

export default function CategoryImport({ onClose, onImported }: { onClose: () => void; onImported: (count: number) => void }) {
  const { importCategories } = useGacha();
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");
  const [preview, setPreview] = useState<ImportedCategory[] | null>(null);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [jsonCopyStatus, setJsonCopyStatus] = useState<"success" | "error" | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  const errorRef = useRef<HTMLParagraphElement>(null);

  function updateText(value: string) {
    setJsonCopyStatus(null);
    setText(value);
    setPreview(null);
    setError("");
  }

  async function loadFile(file?: File) {
    if (!file) return;
    const current = ++request.current;
    setPreview(null);
    setError("");
    if (!file.name.toLowerCase().endsWith(".json")) { setError("Choose a .json file, or paste JSON into the text field."); return; }
    if (file.size > MAX_IMPORT_BYTES) { setError("This file is too large. Choose a JSON file smaller than 512 KB."); return; }
    setLoading(true);
    try {
      const content = await file.text();
      if (current === request.current) updateText(content);
    } catch { if (current === request.current) setError("This file could not be read. Try again or paste its JSON contents instead."); }
    finally { if (current === request.current) setLoading(false); }
  }

  function review() {
    try { setPreview(parseCategoryImport(text)); setError(""); }
    catch (cause) { setPreview(null); setError(cause instanceof Error ? cause.message : "Unable to read this JSON."); requestAnimationFrame(() => errorRef.current?.focus()); }
  }

  return (
    <Modal title="Import categories" onClose={onClose}>
      <p className="-mt-2 text-sm leading-relaxed text-secondary">Add multiple categories and options at once. Paste JSON or upload a file to get started.</p>
      <details className="mt-5 rounded-xl border border-blue-500/25 bg-blue-500/5 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-accent">Generate categories with AI</summary>
        <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs leading-relaxed text-secondary">
          <li>Describe your topic below and copy the prompt.</li>
          <li>Paste the prompt into your preferred AI assistant.</li>
          <li>Copy the JSON response, paste it below, then select <strong>Review import</strong>.</li>
        </ol>
        <label htmlFor="import-topic" className="mt-4 block text-xs font-medium">What would you like to generate?</label>
        <input id="import-topic" value={topic} maxLength={500} onChange={(event) => { setTopic(event.target.value); setCopyStatus(""); }} placeholder="e.g. Weekend activities or indie game ideas" className="mt-2 w-full rounded-lg border border-line bg-background px-3 py-2.5 text-xs focus:border-blue-500 focus:outline-none" />
        <button onClick={async () => {
          try { await navigator.clipboard.writeText(createCategoryPrompt(topic)); setCopyStatus("Prompt copied. Paste it into your AI assistant."); }
          catch { setCopyStatus("Clipboard access is unavailable. Select and copy the prompt below."); }
        }} className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-xs font-medium hover:bg-elevated"><FiCopy />Copy AI prompt</button>
        {copyStatus && <p role="status" className="mt-2 text-xs leading-relaxed text-secondary">{copyStatus}</p>}
        <details className="mt-3 text-xs text-secondary"><summary className="cursor-pointer">View prompt</summary><pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-background p-3 text-[11px] leading-relaxed select-text">{createCategoryPrompt(topic)}</pre></details>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">AI is optional. This app does not send your data to an AI service.</p>
      </details>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="category-json" className="text-sm font-medium">JSON content</label>
        <button disabled={loading} onClick={() => fileInput.current?.click()} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-medium hover:bg-elevated disabled:opacity-40"><FiUpload />{loading ? "Reading file…" : "Upload JSON"}</button>
        <input ref={fileInput} type="file" accept=".json,application/json" aria-label="Upload JSON file" className="hidden" onChange={(event) => { void loadFile(event.target.files?.[0]); event.target.value = ""; }} />
      </div>
      <div className="mt-2 overflow-hidden rounded-xl border border-line bg-background focus-within:border-blue-500">
        <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted">{text.trim() ? "JSON" : "Example JSON"}</span>
          <button type="button" disabled={loading} aria-label={text.trim() ? "Copy JSON content" : "Copy example JSON"} onClick={async () => {
            try { await navigator.clipboard.writeText(text.trim() ? text : CATEGORY_JSON_EXAMPLE); setJsonCopyStatus("success"); }
            catch { setJsonCopyStatus("error"); }
          }} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-secondary transition hover:bg-elevated hover:text-foreground disabled:opacity-40">{jsonCopyStatus === "success" ? <FiCheck className="text-emerald-600 dark:text-emerald-400" /> : <FiCopy />}{jsonCopyStatus === "success" ? "Copied" : "Copy"}</button>
        </div>
        <textarea id="category-json" value={text} disabled={loading} onChange={(event) => updateText(event.target.value)} aria-invalid={!!error} aria-describedby={error ? "import-error import-format" : "import-format"} placeholder={CATEGORY_JSON_EXAMPLE} spellCheck={false} className="block min-h-48 w-full resize-y bg-transparent p-3 font-mono text-xs leading-relaxed focus:outline-none disabled:opacity-50" />
        {jsonCopyStatus && <p role={jsonCopyStatus === "error" ? "alert" : "status"} className={`px-3 pb-3 text-xs leading-relaxed ${jsonCopyStatus === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>{jsonCopyStatus === "error" ? "Clipboard access is unavailable. Select and copy the JSON manually." : text.trim() ? "JSON copied to clipboard." : "Example JSON copied to clipboard."}</p>}
      </div>
      <p id="import-format" className="mt-2 text-[11px] leading-relaxed text-muted">Up to 50 categories, 100 options per category, and 512 KB per import. Names: 60 characters max. Options: 160 characters max.</p>
      {error && <p ref={errorRef} id="import-error" role="alert" tabIndex={-1} className="mt-4 rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-xs leading-relaxed text-red-600 outline-none dark:text-red-400">{error}</p>}
      {preview && <div role="status" className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400"><FiCheck />Ready to import</p>
        <p className="mt-2 text-xs text-secondary">{preview.length} categories · {preview.reduce((total, category) => total + category.options.length, 0)} options</p>
        <ul className="mt-3 max-h-36 space-y-2 overflow-y-auto text-xs text-secondary">{preview.map((category, index) => <li key={index} className="flex justify-between gap-3"><span className="min-w-0 break-words">{category.name}</span><span className="shrink-0 text-muted">{category.options.length} options</span></li>)}</ul>
      </div>}
      <p className="mt-4 text-xs leading-relaxed text-secondary">Imported categories are added to your existing list, including categories with matching names. Existing categories and saved combinations are not changed.</p>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button onClick={onClose} className="rounded-xl border border-line px-4 py-2.5 text-sm hover:bg-elevated">Cancel</button>
        <button disabled={loading || !text.trim()} onClick={() => {
          if (!preview) { review(); return; }
          try { importCategories(text); onImported(preview.length); }
          catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to import categories. Please try again."); }
        }} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-40">{preview ? "Import categories" : "Review import"}</button>
      </div>
    </Modal>
  );
}