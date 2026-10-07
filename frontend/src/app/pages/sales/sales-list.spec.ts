import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SALES } from '../../testing/fixtures';
import { SalesList } from './sales-list';

describe('SalesList', () => {
  let http: HttpTestingController;

  async function render(isAdmin: boolean) {
    TestBed.configureTestingModule({
      imports: [SalesList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { isAdmin: signal(isAdmin) } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SalesList);
    await fixture.whenStable();
    http.expectOne('/api/sales').flush(SALES);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  afterEach(() => http.verify());

  it('lists sales with customer, products and total', async () => {
    const { element } = await render(true);
    const rows = element.querySelectorAll('tbody tr');

    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('#3');
    expect(rows[0].textContent).toContain('Northwind Traders');
    expect(rows[0].textContent).toContain('Laptop Pro 14 × 1');
    expect(rows[0].textContent).toContain('$7,899.90');
    const figures = [...element.querySelectorAll('.summary .kpi')].map(
      (kpi) => `${kpi.querySelector('dt')?.textContent?.trim()} ${kpi.querySelector('dd')?.textContent?.trim()}`,
    );
    expect(figures).toEqual(['Revenue $8,400', 'Sales 2', 'Average sale $4,200']);
  });

  it('shows the seller column to administrators only', async () => {
    const admin = await render(true);
    expect(admin.element.querySelector('thead')?.textContent).toContain('Seller');

    TestBed.resetTestingModule();
    const seller = await render(false);
    expect(seller.element.querySelector('thead')?.textContent).not.toContain('Seller');
  });

  it('filters by customer, seller or product', async () => {
    const { fixture, element } = await render(true);
    const search = element.querySelector<HTMLInputElement>('#sales-search')!;
    search.value = 'mouse';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const rows = element.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Acme Retail Ltd.');
  });

  it('deletes a sale after confirmation', async () => {
    const { fixture, element } = await render(true);
    element.querySelector<HTMLButtonElement>('button[aria-label="Delete sale #3"]')!.click();
    await fixture.whenStable();

    expect(element.querySelector('[role=alertdialog]')?.textContent).toContain('Delete sale #3?');
    element.querySelector<HTMLButtonElement>('.btn-danger')!.click();
    http.expectOne({ method: 'DELETE', url: '/api/sales/3' }).flush(null);
    await fixture.whenStable();

    expect(element.querySelector('[role=alertdialog]')).toBeNull();
    expect(element.querySelectorAll('tbody tr').length).toBe(1);
    expect(element.querySelector('[role=status]')?.textContent).toContain('Sale #3 deleted.');
  });
});
