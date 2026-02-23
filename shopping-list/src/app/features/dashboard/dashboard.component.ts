import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { DashboardService, DashboardStats, ShoppingItem } from './dashboard.service';

const FALLBACK_STATS: DashboardStats = {
  totalItems: 12,
  pendingItems: 8,
  checkedItems: 4,
  categories: [
    { name: 'Produce', count: 4, color: 'badge-success' },
    { name: 'Dairy', count: 3, color: 'badge-info' },
    { name: 'Pantry', count: 3, color: 'badge-warning' },
    { name: 'Bakery', count: 2, color: 'badge-secondary' },
  ],
  recentItems: [
    { id: '1', name: 'Apples', category: 'Produce', quantity: 6, unit: 'pcs', checked: false },
    { id: '2', name: 'Whole Milk', category: 'Dairy', quantity: 1, unit: 'L', checked: true },
    { id: '3', name: 'Sourdough Bread', category: 'Bakery', quantity: 1, unit: 'loaf', checked: false },
    { id: '4', name: 'Pasta', category: 'Pantry', quantity: 2, unit: 'packs', checked: false },
    { id: '5', name: 'Cheddar Cheese', category: 'Dairy', quantity: 200, unit: 'g', checked: true },
  ],
};

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dashboard.component.scss',
  template: `
    <div class="min-h-screen bg-base-200 p-6">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-base-content">Shopping List</h1>
        <p class="text-base-content/60 mt-1">Your weekly grocery overview</p>
      </div>

      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          @for (i of [1, 2, 3]; track i) {
            <div class="skeleton h-24 w-full rounded-box"></div>
          }
        </div>
        <div class="skeleton h-64 w-full rounded-box"></div>
      }

      <!-- Content -->
      @if (!loading()) {

        <!-- Offline notice -->
        @if (usingFallback()) {
          <div class="alert alert-soft alert-warning mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>Showing sample data — backend unavailable</span>
          </div>
        }

        <!-- Stats cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="card bg-base-100 shadow">
            <div class="card-body p-5">
              <div class="flex items-center justify-between">
                <p class="text-base-content/60 text-sm font-medium">Total Items</p>
                <div class="badge badge-primary badge-soft">All</div>
              </div>
              <p class="text-4xl font-bold text-base-content mt-2">{{ stats().totalItems }}</p>
            </div>
          </div>

          <div class="card bg-base-100 shadow">
            <div class="card-body p-5">
              <div class="flex items-center justify-between">
                <p class="text-base-content/60 text-sm font-medium">Still Needed</p>
                <div class="badge badge-warning badge-soft">Pending</div>
              </div>
              <p class="text-4xl font-bold text-warning mt-2">{{ stats().pendingItems }}</p>
            </div>
          </div>

          <div class="card bg-base-100 shadow">
            <div class="card-body p-5">
              <div class="flex items-center justify-between">
                <p class="text-base-content/60 text-sm font-medium">Got It</p>
                <div class="badge badge-success badge-soft">Done</div>
              </div>
              <p class="text-4xl font-bold text-success mt-2">{{ stats().checkedItems }}</p>
              <progress
                class="progress progress-success mt-3"
                [value]="progressPercent()"
                max="100">
              </progress>
            </div>
          </div>
        </div>

        <!-- Categories + Recent items -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Categories -->
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h2 class="card-title text-base">Categories</h2>
              <ul class="list bg-base-100">
                @for (cat of stats().categories; track cat.name) {
                  <li class="list-row py-2 border-b border-base-200 last:border-0">
                    <div class="flex items-center justify-between w-full">
                      <span class="text-base-content font-medium">{{ cat.name }}</span>
                      <div class="badge {{ cat.color }} badge-soft">{{ cat.count }}</div>
                    </div>
                  </li>
                } @empty {
                  <li class="text-base-content/40 text-sm py-4 text-center">No categories yet</li>
                }
              </ul>
            </div>
          </div>

          <!-- Recent items -->
          <div class="card bg-base-100 shadow lg:col-span-2">
            <div class="card-body">
              <h2 class="card-title text-base">Shopping List</h2>
              <ul class="list bg-base-100">
                @for (item of stats().recentItems; track item.id) {
                  <li class="list-row py-3 border-b border-base-200 last:border-0">
                    <div class="flex items-center gap-3 w-full">
                      <div class="status {{ item.checked ? 'status-success' : 'status-warning' }}"></div>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium truncate {{ item.checked ? 'line-through text-base-content/40' : 'text-base-content' }}">
                          {{ item.name }}
                        </p>
                        <p class="text-xs text-base-content/50">{{ item.category }}</p>
                      </div>
                      <div class="text-sm text-base-content/60 shrink-0">
                        {{ item.quantity }} {{ item.unit }}
                      </div>
                    </div>
                  </li>
                } @empty {
                  <li class="text-center py-8">
                    <p class="text-base-content/40">Your list is empty — add some items!</p>
                  </li>
                }
              </ul>
            </div>
          </div>

        </div>
      }

    </div>
  `,
})
export class DashboardComponent {
  private service = inject(DashboardService);

  stats = signal<DashboardStats>(FALLBACK_STATS);
  loading = signal(true);
  usingFallback = signal(false);

  progressPercent = computed(() => {
    const s = this.stats();
    return s.totalItems > 0 ? Math.round((s.checkedItems / s.totalItems) * 100) : 0;
  });

  constructor() {
    this.service.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard stats, using fallback data', err);
        this.usingFallback.set(true);
        this.loading.set(false);
      },
    });
  }
}
