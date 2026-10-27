"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { createStorage } from "@/lib/storage";
import { parseCategoryImport } from "@/lib/categoryImport";
import { createCategories, defaultCategories, isCategories, isSavedResults, presets, type GachaCategory, type GachaResultItem, type PresetId, type SavedResult } from "@/lib/gacha";

export type { GachaCategory, GachaItem, GachaResultItem, SavedResult } from "@/lib/gacha";

const categoryStore = createStorage("gacha_categories", defaultCategories, isCategories);
const resultStore = createStorage<SavedResult[]>("gacha_results", [], isSavedResults);

interface GachaContextType {
  categories: GachaCategory[];
  savedResults: SavedResult[];
  persistent: boolean;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  clearCategories: () => boolean;
  updateCategory: (id: string, name: string) => void;
  toggleCategory: (id: string) => void;
  addItem: (categoryId: string, value: string) => void;
  removeItem: (categoryId: string, itemId: string) => void;
  updateItem: (categoryId: string, itemId: string, value: string) => void;
  applyPreset: (id: PresetId) => void;
  importCategories: (text: string) => void;
  saveResult: (items: GachaResultItem[], title?: string) => void;
  removeResult: (id: string) => void;
  renameResult: (id: string, title: string) => boolean;
  resetGacha: () => boolean;
}

const GachaContext = createContext<GachaContextType | undefined>(undefined);

export function GachaProvider({ children }: { children: React.ReactNode }) {
  const categoryState = useSyncExternalStore(categoryStore.subscribe, categoryStore.getSnapshot, categoryStore.getServerSnapshot);
  const resultState = useSyncExternalStore(resultStore.subscribe, resultStore.getSnapshot, resultStore.getServerSnapshot);
  const setCategories = categoryStore.setValue;
  const editCategory = (id: string, edit: (category: GachaCategory) => GachaCategory) => setCategories((previous) => previous.map((category) => category.id === id ? edit(category) : category));

  return (
    <GachaContext.Provider value={{
      categories: categoryState.value,
      savedResults: resultState.value,
      persistent: categoryState.persistent && resultState.persistent,
      addCategory: (name) => { if (name.trim()) setCategories((previous) => [...previous, { id: crypto.randomUUID(), name: name.trim(), enabled: true, items: [] }]); },
      removeCategory: (id) => setCategories((previous) => previous.filter((category) => category.id !== id)),
      clearCategories: () => {
        setCategories([]);
        return categoryStore.getSnapshot().persistent;
      },
      updateCategory: (id, name) => editCategory(id, (category) => ({ ...category, name })),
      toggleCategory: (id) => editCategory(id, (category) => ({ ...category, enabled: category.enabled === false })),
      addItem: (id, value) => { if (value.trim()) editCategory(id, (category) => ({ ...category, items: [...category.items, { id: crypto.randomUUID(), value: value.trim() }] })); },
      removeItem: (id, itemId) => editCategory(id, (category) => ({ ...category, items: category.items.filter((item) => item.id !== itemId) })),
      updateItem: (id, itemId, value) => editCategory(id, (category) => ({ ...category, items: category.items.map((item) => item.id === itemId ? { ...item, value } : item) })),
      applyPreset: (id) => { const preset = presets.find((preset) => preset.id === id); if (preset) setCategories(createCategories(preset)); },
      importCategories: (text) => {
        const imported = parseCategoryImport(text).map((category) => ({
          id: crypto.randomUUID(), name: category.name, enabled: true,
          items: category.options.map((value) => ({ id: crypto.randomUUID(), value })),
        }));
        setCategories((previous) => [...previous, ...imported]);
      },
      saveResult: (items, title) => { if (items.length) resultStore.setValue((previous) => [{ id: crypto.randomUUID(), items: items.map((item) => ({ ...item })), timestamp: Date.now(), title }, ...previous]); },
      removeResult: (id) => resultStore.setValue((previous) => previous.filter((result) => result.id !== id)),
      renameResult: (id, title) => {
        resultStore.setValue((previous) => previous.map((result) => result.id === id ? { ...result, title: title.trim().slice(0, 80) || undefined } : result));
        return resultStore.getSnapshot().persistent;
      },
      resetGacha: () => {
        categoryStore.setValue(defaultCategories);
        resultStore.setValue([]);
        return categoryStore.getSnapshot().persistent && resultStore.getSnapshot().persistent;
      },
    }}>
      {children}
    </GachaContext.Provider>
  );
}

export function useGacha() {
  const context = useContext(GachaContext);
  if (!context) throw new Error("useGacha must be used within a GachaProvider");
  return context;
}