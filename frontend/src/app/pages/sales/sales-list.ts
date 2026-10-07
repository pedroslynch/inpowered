import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/api-error';
import { APP_CURRENCY, initials } from '../../core/format';
import { Sale } from '../../core/models';
import { SalesService } from '../../core/sales.service';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-sales-list',
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sales-list.html',
  styleUrl: './sales-list.scss',
})
export class SalesList {
  private readonly salesService = inject(SalesService);

  protected readonly currency = APP_CURRENCY;
  protected readonly initials = initials;
  protected readonly isAdmin = inject(AuthService).isAdmin;

  protected readonly sales = signal<Sale[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(
    (inject(Router).currentNavigation()?.extras.state?.['notice'] as string | undefined) ?? null,
  );
  protected readonly query = signal('');

  protected readonly toDelete = signal<Sale | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return this.sales();
    }
    return this.sales().filter((sale) =>
      [
        `#${sale.id}`,
        sale.customer.name,
        sale.seller.name,
        sale.notes ?? '',
        ...sale.items.map((item) => item.productName),
      ].some((value) => value.toLowerCase().includes(query)),
    );
  });

  protected readonly total = computed(() => this.filtered().reduce((sum, sale) => sum + sale.totalAmount, 0));
  protected readonly average = computed(() => (this.filtered().length ? this.total() / this.filtered().length : 0));

  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  constructor() {
    this.load();
    // Move focus into the confirmation dialog when it opens.
    effect(() => this.cancelButton()?.nativeElement.focus());
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.salesService.list().subscribe({
      next: (sales) => {
        this.sales.set(sales);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(errorMessage(err, 'Unable to load sales.'));
        this.loading.set(false);
      },
    });
  }

  protected unitCount(sale: Sale): number {
    return sale.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  protected productSummary(sale: Sale): string {
    return sale.items.map((item) => `${item.productName} × ${item.quantity}`).join(', ');
  }

  protected askDelete(sale: Sale): void {
    this.deleteError.set(null);
    this.toDelete.set(sale);
  }

  protected cancelDelete(): void {
    if (!this.deleting()) {
      this.toDelete.set(null);
    }
  }

  protected confirmDelete(): void {
    const sale = this.toDelete();
    if (!sale) {
      return;
    }
    this.deleting.set(true);
    this.salesService.delete(sale.id).subscribe({
      next: () => {
        this.sales.update((sales) => sales.filter((s) => s.id !== sale.id));
        this.notice.set(`Sale #${sale.id} deleted.`);
        this.deleting.set(false);
        this.toDelete.set(null);
      },
      error: (err: unknown) => {
        this.deleteError.set(errorMessage(err, 'Unable to delete the sale.'));
        this.deleting.set(false);
      },
    });
  }
}
