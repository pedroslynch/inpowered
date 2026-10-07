import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { initials } from '../../core/format';
import { Icon } from '../../shared/icon';
import { Logo } from '../../shared/logo';

interface MenuItem {
  label: string;
  path: string;
}

/** Main page frame shown after sign-in: navbar with the menu, and the routed page. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly roleLabel = computed(() => (this.auth.isAdmin() ? 'Administrator' : 'Seller'));
  protected readonly initials = computed(() => initials(this.user()?.fullName ?? ''));

  /** Menu entries, in display order. Sales is the first item. */
  protected readonly menu: MenuItem[] = [{ label: 'Sales', path: '/sales' }];

  protected signOut(): void {
    this.auth.logout();
  }
}
