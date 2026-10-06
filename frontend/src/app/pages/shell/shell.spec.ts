import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ADMIN } from '../../testing/fixtures';
import { Shell } from './shell';

describe('Shell', () => {
  it('shows Sales as the first menu item, plus the signed-in user', async () => {
    const auth = { user: signal(ADMIN), isAdmin: signal(true), logout: vi.fn() };
    TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const first = element.querySelector<HTMLAnchorElement>('nav.menu a');
    expect(first?.textContent?.trim()).toBe('Sales');
    expect(first?.getAttribute('href')).toBe('/sales');
    expect(element.textContent).toContain('System Administrator');
    expect(element.textContent).toContain('Administrator');

    element.querySelector<HTMLButtonElement>('.sign-out')!.click();
    expect(auth.logout).toHaveBeenCalled();
  });
});
