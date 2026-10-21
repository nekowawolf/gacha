"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FaInfoCircle } from "react-icons/fa";

export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return createPortal(
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-1.5 rounded-lg border border-[hsl(221,91%,93%)] bg-[hsl(208,100%,97%)] p-4 text-[hsl(210,92%,45%)] shadow-[0_4px_12px_#0000001a] min-[601px]:top-6 min-[601px]:w-[356px]"
    >
      <FaInfoCircle size={16} className="-ml-0.5 mr-1 shrink-0" aria-hidden="true" />
      <p role="status" aria-live="polite" aria-atomic="true" className="min-w-0 flex-1 text-[13px] font-medium leading-normal">{message}</p>
    </motion.div>,
    document.body,
  );
}