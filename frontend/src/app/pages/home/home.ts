import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <span class="eyebrow">Dashboard</span>
          <h1>Welcome back, {{ firstName() }}</h1>
          <p>Pick up where you left off.</p>
        </div>
      </header>

      <div class="tiles">
        <a routerLink="/sales" class="tile">
          <span class="tile-icon"><app-icon name="cart" [size]="22" /></span>
          <strong>Sales</strong>
          <span class="muted">Create, review and update sales, their customers and products.</span>
          <span class="go">Open sales <app-icon name="arrow-right" [size]="16" /></span>
        </a>
      </div>
    </div>
  `,
  styles: `
    .tiles {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-4);
    }
    .tile {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      min-height: 200px;
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      background: linear-gradient(225deg, var(--card-from), var(--card-via) 55%, var(--card-to));
      color: inherit;
      font-size: var(--text-sm);
      line-height: 1.55;
      text-decoration: none;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .tile:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgb(44 26 138 / 0.15);
    }
    .tile:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
    .tile-icon {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      margin-bottom: auto;
      border-radius: var(--radius-pill);
      background: var(--neutral-0);
      color: var(--action-primary);
    }
    strong {
      color: var(--text-heading);
      font-size: var(--text-xl);
      font-weight: 500;
    }
    .go {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      margin-top: var(--space-2);
      color: var(--action-primary);
      font-weight: 600;
    }
  `,
})
export class Home {
  private readonly auth = inject(AuthService);

  protected readonly firstName = computed(() => this.auth.user()?.fullName.split(' ')[0] ?? '');
}
