"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FaCheckCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";

export type ToastType = "info" | "success" | "error";

const variants = {
  info: { icon: FaInfoCircle, className: "border-[hsl(221,91%,93%)] bg-[hsl(208,100%,97%)] text-[hsl(210,92%,45%)]" },
  success: { icon: FaCheckCircle, className: "border-[hsl(145,92%,87%)] bg-[hsl(143,85%,96%)] text-[hsl(140,100%,27%)]" },
  error: { icon: FaTimesCircle, className: "border-[hsl(359,100%,94%)] bg-[hsl(359,100%,97%)] text-[hsl(360,100%,45%)]" },
};

export default function Toast({ message, type = "info", onClose }: { message: string; type?: ToastType; onClose: () => void }) {
  const reduced = useReducedMotion();
  const { icon: Icon, className } = variants[type];

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  return createPortal(
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      data-toast-type={type}
      className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-1.5 rounded-lg border p-4 shadow-[0_4px_12px_#0000001a] min-[601px]:top-6 min-[601px]:w-[356px] ${className}`}
    >
      <Icon size={16} className="-ml-0.5 mr-1 shrink-0" aria-hidden="true" />
      <p role={type === "error" ? "alert" : "status"} aria-live={type === "error" ? "assertive" : "polite"} aria-atomic="true" className="min-w-0 flex-1 text-[13px] font-medium leading-normal">{message}</p>
    </motion.div>,
    document.body,
  );
}