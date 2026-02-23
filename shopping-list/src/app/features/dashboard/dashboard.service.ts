import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

export interface CategoryStat {
  name: string;
  count: number;
  color: string;
}

export interface DashboardStats {
  totalItems: number;
  pendingItems: number;
  checkedItems: number;
  categories: CategoryStat[];
  recentItems: ShoppingItem[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/v1/dashboard`;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.baseUrl);
  }
}
