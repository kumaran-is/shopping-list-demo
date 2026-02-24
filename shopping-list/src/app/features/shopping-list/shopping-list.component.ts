import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShoppingListStateService, FilterType, Priority } from './shopping-list-state.service';

@Component({
  selector: 'app-shopping-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  styleUrl: './shopping-list.component.scss',
  template: `
    <div class="min-h-screen bg-base-200 flex flex-col items-center py-10 px-4">
      <div class="w-full max-w-lg flex flex-col gap-6">

        <!-- Header -->
        <div>
          <h1 class="text-3xl font-bold text-base-content">Shopping List</h1>
          <p class="text-base-content/60 mt-1">
            {{ state.remainingCount() }} item{{ state.remainingCount() !== 1 ? 's' : '' }} remaining
          </p>
        </div>

        <!-- Add item form -->
        <div class="card bg-base-100 shadow">
          <div class="card-body p-4">
            <form (ngSubmit)="onAdd()" class="flex gap-2">
              <input
                type="text"
                class="input flex-1"
                placeholder="Item name"
                [(ngModel)]="newName"
                name="newName"
                required
                aria-label="Item name"
              />
              <input
                type="number"
                class="input w-20"
                placeholder="Qty"
                [(ngModel)]="newQuantity"
                name="newQuantity"
                min="1"
                aria-label="Quantity"
              />
              <select
                class="select w-28"
                [(ngModel)]="newPriority"
                name="newPriority"
                aria-label="Priority"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!newName.trim()"
                aria-label="Add item"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        <!-- Filter tabs + clear button -->
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div role="tablist" class="tabs tabs-boxed bg-base-100">
            @for (tab of filterTabs; track tab.value) {
              <button
                role="tab"
                class="tab"
                [class.tab-active]="state.filter() === tab.value"
                (click)="state.setFilter(tab.value)"
              >
                {{ tab.label }}
              </button>
            }
          </div>

          @if (state.totalCount() > state.remainingCount()) {
            <button class="btn btn-ghost btn-sm text-error" (click)="state.clearCompleted()">
              Clear completed
            </button>
          }
        </div>

        <!-- Item list -->
        <div class="card bg-base-100 shadow">
          <ul class="divide-y divide-base-200">
            @for (item of state.filteredItems(); track item.id) {
              <li class="flex items-center gap-3 px-4 py-3">
                <!-- Checkbox -->
                <input
                  type="checkbox"
                  class="checkbox checkbox-primary"
                  [checked]="item.pickedUp"
                  (change)="state.togglePickedUp(item.id)"
                  [attr.aria-label]="'Mark ' + item.name + ' as picked up'"
                />

                <!-- Name + quantity -->
                <div class="flex-1 min-w-0">
                  <span
                    class="font-medium truncate block"
                    [class.line-through]="item.pickedUp"
                    [class.text-base-content]="!item.pickedUp"
                    [class.text-base-content/40]="item.pickedUp"
                  >
                    {{ item.name }}
                  </span>
                  <span class="text-xs text-base-content/50">qty: {{ item.quantity }}</span>
                  <span
                    class="badge badge-sm"
                    [class.badge-error]="item.priority === 'high'"
                    [class.badge-warning]="item.priority === 'medium'"
                    [class.badge-success]="item.priority === 'low'"
                  >
                    {{ item.priority }}
                  </span>
                </div>

                <!-- Delete -->
                <button
                  class="btn btn-ghost btn-sm btn-square text-error"
                  (click)="state.deleteItem(item.id)"
                  [attr.aria-label]="'Delete ' + item.name"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </li>
            } @empty {
              <li class="py-12 text-center text-base-content/40">
                @if (state.filter() === 'all') {
                  <p>Your list is empty — add an item above!</p>
                } @else if (state.filter() === 'pending') {
                  <p>Nothing pending — all done!</p>
                } @else {
                  <p>Nothing picked up yet.</p>
                }
              </li>
            }
          </ul>
        </div>

      </div>
    </div>
  `,
})
export class ShoppingListComponent {
  protected state = inject(ShoppingListStateService);

  newName = '';
  newQuantity = 1;
  newPriority: Priority = 'medium';

  protected readonly filterTabs: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Picked Up', value: 'picked-up' },
  ];

  onAdd(): void {
    this.state.addItem(this.newName, this.newQuantity, this.newPriority);
    this.newName = '';
    this.newQuantity = 1;
    this.newPriority = 'medium';
  }
}
