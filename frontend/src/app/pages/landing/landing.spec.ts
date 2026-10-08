import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Landing } from './landing';

// The first test compiles the large landing template, which can take longer than the 5s default.
describe('Landing', { timeout: 20_000 }, () => {
  async function render() {
    TestBed.configureTestingModule({
      imports: [Landing],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(Landing);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('renders the design sections in English with a link to sign in', async () => {
    const { element } = await render();
    expect(element.querySelector('h1')?.textContent).toContain('AI Decisioning');
    expect(element.textContent).toContain('Agencies Maximizing Outcomes with AI PMPs');
    expect(element.querySelectorAll('.outcome-card')).toHaveLength(8);
    expect(element.querySelectorAll('.case-card')).toHaveLength(3);
    const login = [...element.querySelectorAll<HTMLAnchorElement>('nav a')].find(
      (a) => a.textContent?.trim() === 'Log In',
    );
    expect(login?.getAttribute('href')).toBe('/login');
    const hrefs = (text: string) =>
      [...element.querySelectorAll<HTMLAnchorElement>('nav a')]
        .filter((a) => a.textContent?.trim() === text)
        .map((a) => a.getAttribute('href'));
    expect(hrefs('About Us')).toEqual(['/about', '/about']);
    expect(hrefs('Careers')).toEqual(['/careers', '/careers']);

    const social = [...element.querySelectorAll<HTMLAnchorElement>('.social a')];
    expect(social.map((a) => a.href)).toEqual([
      'https://www.linkedin.com/company/inpoweredai',
      'https://www.instagram.com/inpoweredai',
      'https://twitter.com/inpoweredai',
    ]);
    expect(social.every((a) => a.target === '_blank' && a.rel.includes('noopener'))).toBe(true);
  });

  it('shows Sign out instead of Log In in the footer for a signed-in user', async () => {
    const logout = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { user: signal({ fullName: 'Maria Silva', role: 'SELLER' }), logout },
        },
      ],
    });
    const { element } = await render();
    const footer = element.querySelector('.footer-nav')!;
    expect([...footer.querySelectorAll('a')].some((a) => a.textContent?.trim() === 'Log In')).toBe(false);
    footer.querySelector<HTMLButtonElement>('.footer-sign-out')!.click();
    expect(logout).toHaveBeenCalled();
  });

  it('shows the final stats when they cannot be animated', async () => {
    const { fixture, element } = await render();
    await fixture.whenStable();
    const values = [...element.querySelectorAll('.stats strong')].map((el) => el.textContent?.trim());
    expect(values).toEqual(['$100m+', '70%', '5,000+']);
  });

  it('validates the demo request and then confirms it', async () => {
    const { fixture, element } = await render();
    const submit = () => element.querySelector<HTMLButtonElement>('.demo-submit')!.click();

    submit();
    await fixture.whenStable();
    expect(element.textContent).toContain('Enter your name.');
    expect(element.textContent).toContain('Enter a valid work email.');

    for (const [id, value] of [
      ['demo-name', 'Ana Souza'],
      ['demo-company', 'Acme'],
      ['demo-email', 'ana@acme.com'],
    ]) {
      const input = element.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    submit();
    await fixture.whenStable();
    expect(element.querySelector('[role=status]')?.textContent).toContain('Thanks, we got your request.');
  });
});
