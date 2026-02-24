import { Injectable, signal, computed, effect } from '@angular/core';

export type Priority = 'high' | 'medium' | 'low';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  pickedUp: boolean;
  priority: Priority;
}

export type FilterType = 'all' | 'pending' | 'picked-up';

const STORAGE_KEY = 'shopping-list-items';

const DEFAULT_ITEMS: ShoppingItem[] = [
  { id: '1', name: 'Apples', quantity: 6, pickedUp: false, priority: 'medium' },
  { id: '2', name: 'Whole Milk', quantity: 1, pickedUp: true, priority: 'high' },
  { id: '3', name: 'Sourdough Bread', quantity: 1, pickedUp: false, priority: 'low' },
];

function loadItems(): ShoppingItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_ITEMS;
  try {
    const parsed: ShoppingItem[] = JSON.parse(raw);
    return parsed.map((item) => ({
      ...item,
      priority: item.priority ?? 'medium',
    }));
  } catch {
    return DEFAULT_ITEMS;
  }
}

@Injectable({ providedIn: 'root' })
export class ShoppingListStateService {
  private items = signal<ShoppingItem[]>(loadItems());

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
    });
  }

  filter = signal<FilterType>('all');

  filteredItems = computed(() => {
    const f = this.filter();
    const all = this.items();
    if (f === 'pending') return all.filter((i) => !i.pickedUp);
    if (f === 'picked-up') return all.filter((i) => i.pickedUp);
    return all;
  });

  remainingCount = computed(() => this.items().filter((i) => !i.pickedUp).length);

  totalCount = computed(() => this.items().length);

  addItem(name: string, quantity: number, priority: Priority = 'medium'): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    this.items.update((list) => [
      ...list,
      { id: crypto.randomUUID(), name: trimmed, quantity, pickedUp: false, priority },
    ]);
  }

  togglePickedUp(id: string): void {
    this.items.update((list) =>
      list.map((item) =>
        item.id === id ? { ...item, pickedUp: !item.pickedUp } : item,
      ),
    );
  }

  deleteItem(id: string): void {
    this.items.update((list) => list.filter((item) => item.id !== id));
  }

  clearCompleted(): void {
    this.items.update((list) => list.filter((item) => !item.pickedUp));
  }

  setFilter(f: FilterType): void {
    this.filter.set(f);
  }
}
