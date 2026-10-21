export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic" | "normal";
export type GachaItem = { id: string; value: string };
export type GachaCategory = { id: string; name: string; items: GachaItem[]; enabled?: boolean };
export type GachaResultItem = { categoryName: string; itemValue: string; rarity?: Rarity };
export type SavedResult = { id: string; items: GachaResultItem[]; timestamp: number; title?: string };
export type PresetId = "website" | "game" | "content" | "daily";
export type Preset = { id: PresetId; name: string; description: string; categories: { name: string; options: string[] }[] };

export const presets: Preset[] = [
  {
    id: "website", name: "Website", description: "Website type, design style, color palette, and deadline.",
    categories: [
      { name: "Website type", options: ["Creative portfolio", "Landing page", "Dashboard", "Online store", "Community website", "Personal blog"] },
      { name: "Design style", options: ["Minimalist", "Neo-brutalism", "Glassmorphism", "Retro futurism", "Editorial", "Bento grid"] },
      { name: "Color palette", options: ["Ocean blue · #2563EB #93C5FD #0F172A", "Matcha · #84A98C #CAD2C5 #2F3E46", "Sunset · #F97316 #FDBA74 #431407", "Lavender · #A78BFA #DDD6FE #2E1065", "Monochrome · #FAFAFA #A1A1AA #18181B"] },
      { name: "Deadline", options: ["24 hours", "3 days", "1 week", "2 weeks", "1 month"] },
    ],
  },
  {
    id: "game", name: "Game", description: "Game genre, world theme, visual style, and deadline.",
    categories: [
      { name: "Genre", options: ["Platformer", "Roguelike", "Puzzle", "Survival", "Simulation", "Rhythm game"] },
      { name: "World theme", options: ["Cyberpunk", "Enchanted forest", "Outer space", "Underwater", "Post-apocalyptic", "Small town"] },
      { name: "Visual", options: ["Pixel art", "Low poly", "Hand-drawn", "Monochrome", "Voxel"] },
      { name: "Deadline", options: ["48 hours", "1 week", "2 weeks", "1 month"] },
    ],
  },
  {
    id: "content", name: "Content", description: "Content topic, format, platform, and duration.",
    categories: [
      { name: "Topic", options: ["Coding", "UI design", "Productivity", "Behind the scenes", "Creative experiment"] },
      { name: "Format", options: ["Quick tutorial", "Challenge", "Timelapse", "Personal story", "Before & after"] },
      { name: "Platform", options: ["YouTube", "YouTube Shorts", "Instagram Reels", "TikTok"] },
      { name: "Duration", options: ["30 seconds", "1 minute", "3 minutes", "5 minutes"] },
    ],
  },
  {
    id: "daily", name: "Everyday", description: "Activity, place, and start time.",
    categories: [
      { name: "Activity", options: ["Read a book", "Take a walk", "Learn something new", "Try a new recipe", "Build a side project"] },
      { name: "Place", options: ["At home", "Favorite café", "Library", "City park"] },
      { name: "Start time", options: ["Right now", "In 30 minutes", "This afternoon", "Tomorrow morning"] },
    ],
  },
];

export function createCategories(preset: Preset): GachaCategory[] {
  return preset.categories.map((category, i) => ({
    id: `${preset.id}-${i}`, name: category.name, enabled: true,
    items: category.options.map((value, j) => ({ id: `${preset.id}-${i}-${j}`, value })),
  }));
}

export const defaultCategories: GachaCategory[] = [];
export function activeCategories(categories: GachaCategory[]) {
  return categories.filter((category) => category.enabled !== false && category.name.trim() && category.items.some((item) => item.value.trim()));
}

// Rejection sampling avoids modulo bias, so every option has the same chance.
export function randomIndex(length: number): number {
  if (!Number.isInteger(length) || length < 1 || length > 0x100000000) throw new RangeError("Invalid pool size");
  const limit = Math.floor(0x100000000 / length) * length;
  const buffer = new Uint32Array(1);
  do { globalThis.crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % length;
}

export function drawResults(categories: GachaCategory[], pick: (length: number) => number = randomIndex): GachaResultItem[] {
  return activeCategories(categories).map((category) => {
    const options = category.items.filter((item) => item.value.trim());
    // Rarity is purely a visual effect; it never changes an option's probability.
    const roll = pick(100);
    const rarity: Rarity = roll >= 97 ? "mythic" : roll >= 88 ? "legendary" : roll >= 65 ? "epic" : roll >= 35 ? "rare" : "uncommon";
    return { categoryName: category.name.trim(), itemValue: options[pick(options.length)].value.trim(), rarity };
  });
}

export function combinationCount(categories: GachaCategory[]): number {
  const active = activeCategories(categories);
  return active.length ? active.reduce((total, category) => total * category.items.filter((item) => item.value.trim()).length, 1) : 0;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
export function isCategories(value: unknown): value is GachaCategory[] {
  return Array.isArray(value) && value.every((category) => isRecord(category) && typeof category.id === "string" && typeof category.name === "string" && (category.enabled === undefined || typeof category.enabled === "boolean") && Array.isArray(category.items) && category.items.every((item: unknown) => isRecord(item) && typeof item.id === "string" && typeof item.value === "string"));
}
export function isSavedResults(value: unknown): value is SavedResult[] {
  const rarities: unknown[] = [undefined, "normal", "common", "uncommon", "rare", "epic", "legendary", "mythic"];
  return Array.isArray(value) && value.every((result) => isRecord(result) && typeof result.id === "string" && typeof result.timestamp === "number" && Number.isFinite(result.timestamp) && Math.abs(result.timestamp) <= 8640000000000000 && (result.title === undefined || typeof result.title === "string") && Array.isArray(result.items) && result.items.every((item: unknown) => isRecord(item) && typeof item.categoryName === "string" && typeof item.itemValue === "string" && rarities.includes(item.rarity)));
}

export function formatResults(items: GachaResultItem[]): string {
  return items.map((item) => `${item.categoryName}: ${item.itemValue}`).join("\n");
}

export function getPalette(value: string): string[] {
  return value.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
}