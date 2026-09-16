"use client";

import { useEffect, useId, useRef } from "react";
import { FiX } from "react-icons/fi";

export default function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog ref={dialog} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-foreground shadow-2xl backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm">
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-bold tracking-tight">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="-mr-2 -mt-2 flex size-10 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-elevated hover:text-foreground"><FiX size={20} /></button>
        </div>
        {children}
      </div>
    </dialog>
  );
}