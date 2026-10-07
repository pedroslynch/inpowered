import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero-band">
      <div class="hero-inner">
        <div>
          <h1>Welcome back, {{ firstName() }}</h1>
          <p>Register sales, follow revenue and keep every customer's order in one place.</p>
        </div>
      </div>
    </section>

    <div class="page-body">
      <div class="tiles">
        <a routerLink="/sales" class="tile sales">
          <strong>Sales</strong>
          <span>Review, update and delete sales, with their customers, products and totals.</span>
          <span class="go">Open sales <app-icon name="arrow-right" [size]="16" /></span>
        </a>
        <a routerLink="/sales/new" [queryParams]="{ from: 'home' }" class="tile new">
          <strong>New sale</strong>
          <span>Pick a customer and the products sold; the total is worked out for you.</span>
          <span class="go">Register a sale <app-icon name="arrow-right" [size]="16" /></span>
        </a>
      </div>
    </div>
  `,
  styles: `
    .tiles {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-4);
    }
    /* The gradients of the site's outcome cards. */
    .tile {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      min-height: 220px;
      padding: var(--space-8) var(--space-10);
      border-radius: 32px;
      color: var(--text-heading);
      font-weight: 300;
      line-height: 1.5;
      text-decoration: none;
      box-shadow: 0 16px 48px rgb(25 2 65 / 0.08);
      transition: box-shadow 0.2s;

      &:hover {
        box-shadow: 0 20px 56px rgb(25 2 65 / 0.16);
      }

      &:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      &.sales {
        background: radial-gradient(100% 100% at 90% 8%, #7697f0 0%, #c2ddfb 40%, #def9ff 100%);
      }

      &.new {
        background: linear-gradient(225deg, #d2d9fc 50%, #a6d9f6 100%);
      }
    }
    strong {
      margin-top: auto;
      font-size: 25px;
      font-weight: 600;
      line-height: 1.2;
    }
    .go {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-3);
      color: var(--action-primary);
      font-weight: 500;
    }
  `,
})
export class Home {
  private readonly auth = inject(AuthService);

  protected readonly firstName = computed(() => this.auth.user()?.fullName.split(' ')[0] ?? '');
}
