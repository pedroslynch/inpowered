import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, map, of, startWith } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { errorMessage, fieldErrors } from '../../core/api-error';
import { APP_CURRENCY, today } from '../../core/format';
import { Customer, Product, Sale, SaleRequest, Seller } from '../../core/models';
import { SalesService } from '../../core/sales.service';
import { Icon } from '../../shared/icon';

type ItemForm = FormGroup<{
  productId: FormControl<number | null>;
  quantity: FormControl<number>;
}>;

/** Create (`/sales/new`) and edit (`/sales/:id/edit`) a sale. */
@Component({
  selector: 'app-sale-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sale-form.html',
  styleUrl: './sale-form.scss',
})
export class SaleForm implements OnInit {
  private readonly salesService = inject(SalesService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  /** Route parameter; absent when creating. */
  readonly id = input<string>();
  /** Query parameter: `home` when the form was opened from the home page. */
  readonly from = input<string>();

  protected readonly currency = APP_CURRENCY;
  protected readonly isAdmin = inject(AuthService).isAdmin;
  /** Where Cancel goes: back to the page that opened the form. */
  protected readonly cancelLink = computed(() => (this.from() === 'home' ? '/home' : '/sales'));
  protected readonly saleId = computed(() => (this.id() ? Number(this.id()) : null));

  protected readonly customers = signal<Customer[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly sellers = signal<Seller[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly saveFieldErrors = signal<string[]>([]);

  /** Unit prices already stored in the sale being edited; they are kept on save. */
  private readonly storedPrices = new Map<number, number>();

  protected readonly form = this.fb.group({
    sellerId: this.fb.control<number | null>(null),
    customerId: this.fb.control<number | null>(null, Validators.required),
    saleDate: [today(), Validators.required],
    notes: ['', Validators.maxLength(500)],
    items: this.fb.array<ItemForm>([], Validators.required),
  });

  private readonly items$ = this.form.controls.items.valueChanges.pipe(
    startWith(null),
    map(() => this.form.controls.items.getRawValue()),
  );
  private readonly itemValues = toSignal(this.items$, { requireSync: true });

  protected readonly lines = computed(() => {
    const products = new Map(this.products().map((product) => [product.id, product]));
    return this.itemValues().map(({ productId, quantity }) => {
      const product = productId == null ? undefined : products.get(productId);
      const unitPrice = productId == null ? 0 : (this.storedPrices.get(productId) ?? product?.price ?? 0);
      const subtotal = unitPrice * (Number(quantity) > 0 ? Number(quantity) : 0);
      return { product, unitPrice, subtotal };
    });
  });

  protected readonly total = computed(() => this.lines().reduce((sum, line) => sum + line.subtotal, 0));

  private readonly customerId = toSignal(this.form.controls.customerId.valueChanges, {
    initialValue: this.form.controls.customerId.value,
  });

  protected readonly customerName = computed(
    () => this.customers().find((customer) => customer.id === this.customerId())?.name ?? null,
  );

  protected readonly productCount = computed(() => this.lines().filter((line) => line.product).length);

  protected readonly unitCount = computed(() =>
    this.itemValues().reduce((sum, item) => sum + (item.productId != null && Number(item.quantity) > 0 ? Number(item.quantity) : 0), 0),
  );

  get itemForms(): ItemForm[] {
    return this.form.controls.items.controls;
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.form.controls.sellerId.addValidators(Validators.required);
    }
    const id = this.saleId();
    forkJoin({
      customers: this.salesService.customers(),
      products: this.salesService.products(),
      sellers: this.isAdmin() ? this.salesService.sellers() : of<Seller[]>([]),
      sale: id ? this.salesService.get(id) : of(null),
    }).subscribe({
      next: ({ customers, products, sellers, sale }) => {
        this.customers.set(customers);
        this.products.set(products);
        this.sellers.set(sellers);
        if (sale) {
          this.fill(sale);
        } else {
          this.addItem();
        }
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loadError.set(errorMessage(err, 'Unable to load the sale form.'));
        this.loading.set(false);
      },
    });
  }

  protected addItem(): void {
    this.form.controls.items.push(
      this.fb.group({
        productId: this.fb.control<number | null>(null, Validators.required),
        quantity: this.fb.control(1, [Validators.required, Validators.min(1), Validators.max(100000)]),
      }),
    );
  }

  /** Quantity buttons: add or remove one unit, never below 1. */
  protected changeQuantity(index: number, delta: number): void {
    const control = this.itemForms[index].controls.quantity;
    control.setValue(Math.max(1, (Number(control.value) || 0) + delta));
    control.markAsTouched();
  }

  protected removeItem(index: number): void {
    this.form.controls.items.removeAt(index);
  }

  /** A product already chosen in another line cannot be chosen again. */
  protected isTaken(productId: number, index: number): boolean {
    return this.itemValues().some((item, i) => i !== index && item.productId === productId);
  }

  protected invalid(control: FormControl<unknown>): boolean {
    return control.invalid && control.touched;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const request: SaleRequest = {
      sellerId: this.isAdmin() ? value.sellerId : null,
      customerId: value.customerId!,
      saleDate: value.saleDate,
      notes: value.notes.trim() || null,
      items: value.items.map((item) => ({ productId: item.productId!, quantity: Number(item.quantity) })),
    };
    const id = this.saleId();
    this.saving.set(true);
    this.saveError.set(null);
    this.saveFieldErrors.set([]);
    (id ? this.salesService.update(id, request) : this.salesService.create(request)).subscribe({
      next: (sale) =>
        this.router.navigate(['/sales'], {
          state: { notice: `Sale #${sale.id} ${id ? 'updated' : 'created'}.` },
        }),
      error: (err: unknown) => {
        this.saving.set(false);
        this.saveError.set(errorMessage(err, 'Unable to save the sale.'));
        this.saveFieldErrors.set(Object.entries(fieldErrors(err)).map(([field, message]) => `${field}: ${message}`));
      },
    });
  }

  private fill(sale: Sale): void {
    for (const item of sale.items) {
      this.storedPrices.set(item.productId, item.unitPrice);
      this.addItem();
      this.itemForms.at(-1)!.setValue({ productId: item.productId, quantity: item.quantity });
    }
    this.form.patchValue({
      sellerId: sale.seller.id,
      customerId: sale.customer.id,
      saleDate: sale.saleDate,
      notes: sale.notes ?? '',
    });
  }
}
