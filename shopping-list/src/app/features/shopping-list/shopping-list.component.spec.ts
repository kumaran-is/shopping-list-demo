import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ShoppingListComponent } from './shopping-list.component';
import { ShoppingListStateService } from './shopping-list-state.service';

describe('ShoppingListComponent', () => {
  let fixture: ComponentFixture<ShoppingListComponent>;
  let component: ShoppingListComponent;
  let state: ShoppingListStateService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ShoppingListComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingListComponent);
    component = fixture.componentInstance;
    state = TestBed.inject(ShoppingListStateService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all items by default', async () => {
    const initial = state.totalCount();
    expect(initial).toBeGreaterThan(0);
    expect(state.filter()).toBe('all');
  });

  it('should add an item', async () => {
    const before = state.totalCount();
    state.addItem('Eggs', 12);
    expect(state.totalCount()).toBe(before + 1);
    expect(state.filteredItems().at(-1)?.name).toBe('Eggs');
  });

  it('should add an item with priority', () => {
    state.addItem('Urgent Item', 1, 'high');
    const added = state.filteredItems().at(-1)!;
    expect(added.priority).toBe('high');
  });

  it('should default priority to medium', () => {
    state.addItem('Normal Item', 1);
    const added = state.filteredItems().at(-1)!;
    expect(added.priority).toBe('medium');
  });

  it('should not add an item with blank name', () => {
    const before = state.totalCount();
    state.addItem('   ', 1);
    expect(state.totalCount()).toBe(before);
  });

  it('should toggle picked up', () => {
    const item = state.filteredItems()[0];
    const was = item.pickedUp;
    state.togglePickedUp(item.id);
    expect(state.filteredItems().find((i) => i.id === item.id)?.pickedUp).toBe(!was);
  });

  it('should delete an item', () => {
    const before = state.totalCount();
    const id = state.filteredItems()[0].id;
    state.deleteItem(id);
    expect(state.totalCount()).toBe(before - 1);
    expect(state.filteredItems().find((i) => i.id === id)).toBeUndefined();
  });

  it('should filter pending items', () => {
    // Ensure at least one item is pending
    state.filteredItems().filter((i) => i.pickedUp).forEach((i) => state.togglePickedUp(i.id));
    state.setFilter('pending');
    expect(state.filteredItems().every((i) => !i.pickedUp)).toBeTruthy();
  });

  it('should filter picked-up items', () => {
    state.setFilter('picked-up');
    expect(state.filteredItems().every((i) => i.pickedUp)).toBeTruthy();
  });

  it('should clear completed items', () => {
    state.setFilter('all');
    const completedBefore = state.totalCount() - state.remainingCount();
    if (completedBefore === 0) {
      state.togglePickedUp(state.filteredItems()[0].id);
    }
    state.clearCompleted();
    expect(state.remainingCount()).toBe(state.totalCount());
  });

  it('should compute remaining count correctly', () => {
    state.setFilter('all');
    const all = state.filteredItems();
    const expected = all.filter((i) => !i.pickedUp).length;
    expect(state.remainingCount()).toBe(expected);
  });
});
