"use client";

import { useSyncExternalStore } from "react";
import { createStorage } from "@/lib/storage";

const soundStore = createStorage("gacha_sound", true, (value): value is boolean => typeof value === "boolean");
let audio: AudioContext | null = null;
const voices = new Set<OscillatorNode>();
export type Sound = "click" | "shuffle" | "charge" | "reveal" | "save";

function stopSound() {
  for (const voice of voices) { try { voice.stop(); } catch { /* Already stopped. */ } }
  voices.clear();
}

function playSound(sound: Sound, special = false) {
  if (!soundStore.getSnapshot().value) return;
  try {
    audio ??= new AudioContext();
    const context = audio;
    if (context.state === "suspended") void context.resume().catch(() => undefined);
    const now = context.currentTime;
    const tone = (frequency: number, offset: number, duration: number, type: OscillatorType = "sine", volume = 0.045, endFrequency?: number) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now + offset);
      if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + offset + duration);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(volume, now + offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      voices.add(oscillator);
      oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(now + offset);
      oscillator.stop(now + offset + duration + 0.02);
    };
    if (sound === "click") tone(680, 0, 0.07, "sine", 0.025);
    if (sound === "shuffle") [0, 0.09, 0.18, 0.3, 0.45, 0.64].forEach((delay, i) => tone(160 + i * 85, delay, 0.08, "triangle", 0.035));
    if (sound === "charge") { tone(100, 0, 0.55, "triangle", 0.035, 750); tone(200, 0.08, 0.5, "sine", 0.025, 1100); }
    if (sound === "reveal") {
      tone(75, 0, 0.35, "sine", 0.09, 35);
      (special ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [523.25, 659.25, 783.99]).forEach((note, i) => tone(note, i * 0.065, 0.65, "sine", 0.04));
    }
    if (sound === "save") { tone(659.25, 0, 0.18); tone(987.77, 0.12, 0.32); }
  } catch { /* Audio is optional; unsupported browsers can still use the studio. */ }
}

export function useSound() {
  const { value: enabled } = useSyncExternalStore(soundStore.subscribe, soundStore.getSnapshot, soundStore.getServerSnapshot);
  const toggle = () => {
    const next = !soundStore.getSnapshot().value;
    soundStore.setValue(next);
    if (next) playSound("click"); else stopSound();
  };
  return { enabled, toggle, play: playSound, stop: stopSound };
}