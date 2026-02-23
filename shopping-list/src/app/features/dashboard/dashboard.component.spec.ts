import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardStats } from './dashboard.service';

const MOCK_STATS: DashboardStats = {
  totalItems: 5,
  pendingItems: 3,
  checkedItems: 2,
  categories: [{ name: 'Produce', count: 3, color: 'badge-success' }],
  recentItems: [
    { id: '1', name: 'Apples', category: 'Produce', quantity: 4, unit: 'pcs', checked: false },
  ],
};

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', async () => {
    httpMock.expectOne((req) => req.url.includes('/dashboard')).flush(MOCK_STATS);
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('should display stats after successful API call', async () => {
    httpMock.expectOne((req) => req.url.includes('/dashboard')).flush(MOCK_STATS);
    await fixture.whenStable();

    expect(component.stats().totalItems).toBe(5);
    expect(component.stats().pendingItems).toBe(3);
    expect(component.usingFallback()).toBeFalsy();
  });

  it('should use fallback data when API fails', async () => {
    httpMock.expectOne((req) => req.url.includes('/dashboard')).error(new ProgressEvent('error'));
    await fixture.whenStable();

    expect(component.usingFallback()).toBeTruthy();
    expect(component.loading()).toBeFalsy();
    expect(component.stats().totalItems).toBeGreaterThan(0);
  });

  it('should compute progress percent correctly', async () => {
    httpMock.expectOne((req) => req.url.includes('/dashboard')).flush(MOCK_STATS);
    await fixture.whenStable();

    expect(component.progressPercent()).toBe(40); // 2/5 = 40%
  });
});
