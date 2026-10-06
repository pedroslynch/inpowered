import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Sale } from '../../core/models';
import { PRODUCTS, SALES } from '../../testing/fixtures';
import { SaleForm } from './sale-form';

describe('SaleForm', () => {
  let http: HttpTestingController;
  const customers = [{ id: 1, name: 'Acme Retail Ltd.', email: null }];
  const sellers = [{ id: 1, name: 'Maria Silva', email: 'maria.silva@inpowered.ai' }];

  async function render(options: { isAdmin: boolean; id?: string; sale?: Sale }) {
    TestBed.configureTestingModule({
      imports: [SaleForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { isAdmin: signal(options.isAdmin) } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SaleForm);
    if (options.id) {
      fixture.componentRef.setInput('id', options.id);
    }
    await fixture.whenStable();
    http.expectOne('/api/customers').flush(customers);
    http.expectOne('/api/products').flush(PRODUCTS);
    if (options.isAdmin) {
      http.expectOne('/api/sellers').flush(sellers);
    }
    if (options.id) {
      http.expectOne(`/api/sales/${options.id}`).flush(options.sale!);
    }
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  function select(element: HTMLElement, selector: string, index: number) {
    const control = element.querySelector<HTMLSelectElement>(selector)!;
    control.selectedIndex = index;
    control.dispatchEvent(new Event('change'));
  }

  function type(element: HTMLElement, selector: string, value: string) {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  afterEach(() => http.verify());

  it('creates a sale as a seller, computing the total as products change', async () => {
    const { fixture, element } = await render({ isAdmin: false });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    expect(element.querySelector('h1')?.textContent).toContain('New sale');
    expect(element.querySelector('#seller')).toBeNull();

    select(element, '#customer', 1);
    select(element, '#product-0', 2); // Wireless Mouse
    type(element, '#quantity-0', '3');
    element.querySelector<HTMLButtonElement>('.section-head button')!.click();
    await fixture.whenStable();
    select(element, '#product-1', 1); // Laptop Pro 14
    await fixture.whenStable();

    expect(element.querySelector('.total')?.textContent).toContain('$8,649.60');
    // The mouse is already used in line 1, so it cannot be picked again in line 2.
    expect(element.querySelectorAll<HTMLOptionElement>('#product-1 option')[2].disabled).toBe(true);

    element.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    const request = http.expectOne({ method: 'POST', url: '/api/sales' });
    expect(request.request.body).toEqual({
      sellerId: null,
      customerId: 1,
      saleDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      notes: null,
      items: [
        { productId: 2, quantity: 3 },
        { productId: 1, quantity: 1 },
      ],
    });
    request.flush({ ...SALES[0], id: 9 });
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/sales'], { state: { notice: 'Sale #9 created.' } });
  });

  it('requires seller, customer and product before saving', async () => {
    const { fixture, element } = await render({ isAdmin: true });
    element.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();

    expect(element.textContent).toContain('Select a seller.');
    expect(element.textContent).toContain('Select a customer.');
    http.expectNone('/api/sales');
  });

  it('edits a sale keeping the unit price it was sold at', async () => {
    const sale: Sale = { ...SALES[1], items: [{ ...SALES[1].items[0], unitPrice: 200 }] };
    const { fixture, element } = await render({ isAdmin: true, id: '1', sale });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    expect(element.querySelector('h1')?.textContent).toContain('Edit sale #1');
    expect(element.querySelector('.total')?.textContent).toContain('$400.00');

    type(element, '#notes', 'Updated notes');
    element.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    const request = http.expectOne({ method: 'PUT', url: '/api/sales/1' });
    expect(request.request.body).toEqual({
      sellerId: 1,
      customerId: 1,
      saleDate: '2026-09-28',
      notes: 'Updated notes',
      items: [{ productId: 2, quantity: 2 }],
    });
    request.flush(sale);
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/sales'], { state: { notice: 'Sale #1 updated.' } });
  });
});
