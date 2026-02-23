import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'shopping-list', pathMatch: 'full' },
  {
    path: 'shopping-list',
    loadComponent: () =>
      import('./features/shopping-list/shopping-list.component').then(
        (m) => m.ShoppingListComponent,
      ),
  },
  { path: '**', redirectTo: 'shopping-list' },
];
