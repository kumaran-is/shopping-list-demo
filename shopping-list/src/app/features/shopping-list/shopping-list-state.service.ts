import { Injectable, signal, computed } from '@angular/core';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  pickedUp: boolean;
}

export type FilterType = 'all' | 'pending' | 'picked-up';

@Injectable({ providedIn: 'root' })
export class ShoppingListStateService {
  private items = signal<ShoppingItem[]>([
    { id: '1', name: 'Apples', quantity: 6, pickedUp: false },
    { id: '2', name: 'Whole Milk', quantity: 1, pickedUp: true },
    { id: '3', name: 'Sourdough Bread', quantity: 1, pickedUp: false },
  ]);

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

  addItem(name: string, quantity: number): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    this.items.update((list) => [
      ...list,
      { id: crypto.randomUUID(), name: trimmed, quantity, pickedUp: false },
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
