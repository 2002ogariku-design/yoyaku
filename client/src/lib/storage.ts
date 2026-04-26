import type { Item } from "../types";
import INITIAL_DATA from "../data.json";

const STORAGE_KEY = "rinkan_items";

export function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Item[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_DATA as Item[];
}

export function saveItems(items: Item[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function resetItems(): Item[] {
  const items = INITIAL_DATA as Item[];
  saveItems(items);
  return items;
}
