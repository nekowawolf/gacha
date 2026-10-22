"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CardBack } from "./Card";

export const SHUFFLE_DURATION = 2100;
const duration = SHUFFLE_DURATION / 1000;
const times = [0, 0.18, 0.4, 0.59, 0.77, 0.9, 1];
const cards = [-2, 2, -1, 1, 0];

export default function DrawDeck({ shuffling }: { shuffling: boolean }) {
  const reduced = useReducedMotion();
  const animated = shuffling && !reduced;

  return (
    <div aria-hidden="true" className="relative my-4 h-[280px] w-full max-w-[430px] sm:h-[305px]">
      <div className="absolute inset-0 scale-[0.75] sm:scale-100">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={animated ? { opacity: [0.25, 0.65, 0.35, 0.8, 0.2], scale: [0.8, 1.1, 0.9, 1.25, 1] } : { opacity: 0.4, scale: 1 }}
          transition={{ duration: animated ? duration : 0 }}
          className="absolute h-44 w-56 rounded-full bg-blue-500/30 blur-3xl light:bg-blue-500/20"
        />
        {animated && <>
          {[0, 1].map((ring) => <motion.div key={ring}
            initial={{ opacity: 0, scale: 0.55, rotateX: 65, rotateZ: ring * 45 }}
            animate={{ opacity: [0, 0.65, 0.45, 0], scale: [0.55, 1, 1.25, 1.45], rotateZ: ring * 45 + 120 }}
            transition={{ duration: 1.7, delay: ring * 0.15, ease: "easeOut" }}
            className="absolute size-[260px] rounded-full border border-blue-400/50 shadow-[0_0_18px_#60a5fa30] light:border-blue-500/40 sm:size-[330px]"
          />)}
          {Array.from({ length: 12 }, (_, index) => {
            const angle = index * Math.PI / 6;
            return <motion.span key={index}
              initial={{ x: Math.cos(angle) * 125, y: Math.sin(angle) * 125, opacity: 0, scale: 0 }}
              animate={{ x: [Math.cos(angle) * 125, Math.cos(angle) * 155, 0], y: [Math.sin(angle) * 125, Math.sin(angle) * 145, 0], opacity: [0, 0.8, 0], scale: [0, 1, 0.4] }}
              transition={{ duration: 1.3, delay: 0.3 + index % 3 * 0.08, ease: "easeInOut" }}
              className="absolute size-1 rounded-full bg-blue-300 shadow-[0_0_8px_#93c5fd] light:bg-blue-500"
            />;
          })}
        </>}
      </div>

      <div className="absolute inset-0 perspective-[1000px]">
        {cards.map((direction, index) => {
          const side = direction === 0 ? 1 : Math.sign(direction);
          const resting = { x: direction * 27, y: Math.abs(direction) * 10 + 8, rotate: direction * 9, rotateY: 0, scale: 1 };
          return <motion.div key={`${shuffling}-${direction}`}
            initial={resting}
            animate={animated ? {
              x: [direction * 27, direction * 4, side * (75 + index * 6), -side * (68 + index * 5), direction * 33, direction * 2, 0],
              y: [Math.abs(direction) * 10 + 8, index * -3, -24 + index * 8, -16 + index * 6, -22 + Math.abs(direction) * 12, -18 - index * 2, -32],
              rotate: [direction * 9, direction * 2, side * 19, -side * 15, direction * 12, direction, 0],
              rotateY: [0, -side * 12, side * 28, -side * 24, side * 12, 0, 0],
              scale: [1, 0.94, 0.96, 0.96, 1.02, 1.04, 0.92],
            } : resting}
            transition={{ duration: animated ? duration : 0, times, ease: "easeInOut" }}
            style={{ zIndex: index + 1 }}
            className="absolute left-1/2 top-4 h-[228px] w-[152px] -translate-x-1/2 rounded-xl shadow-[0_18px_40px_#0006] light:shadow-[0_18px_40px_#1e40af20] sm:h-[250px] sm:w-[167px]"
          >
            <CardBack index={index} />
            {animated && <motion.div
              initial={{ opacity: 0, x: "-120%" }} animate={{ opacity: [0, 0.5, 0], x: "120%" }}
              transition={{ delay: 1.55, duration: 0.5 }}
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
            ><div className="h-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-blue-100/40 to-transparent" /></motion.div>}
          </motion.div>;
        })}
      </div>

      </div>
      {shuffling && <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2">
        {["Gather", "Shuffle", "Deal"].map((label, index) => <motion.span key={label}
          initial={{ opacity: reduced ? 1 : 0.35 }} animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : index * 0.75, duration: reduced ? 0 : 0.2 }}
          className="flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.18em] text-accent"
        ><span className="size-1 rounded-full bg-current" />{label}</motion.span>)}
      </div>}
    </div>
  );
}