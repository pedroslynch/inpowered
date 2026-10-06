import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { ADMIN } from '../../testing/fixtures';
import { Login } from './login';

describe('Login', () => {
  const auth = { login: vi.fn() };

  async function render() {
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  function type(element: HTMLElement, selector: string, value: string) {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  beforeEach(() => auth.login.mockReset());

  it('renders the sign-in form in English', async () => {
    const { element } = await render();
    expect(element.querySelector('h2')?.textContent).toContain('Welcome back');
    expect(element.querySelector('button[type=submit]')?.textContent).toContain('Sign In');
    expect(element.textContent).toContain('Keep me signed in');
  });

  it('validates fields before calling the API', async () => {
    const { fixture, element } = await render();
    element.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();

    expect(auth.login).not.toHaveBeenCalled();
    expect(element.textContent).toContain('Enter a valid email address.');
    expect(element.textContent).toContain('Enter your password.');
  });

  it('signs in and opens the home page', async () => {
    auth.login.mockReturnValue(of(ADMIN));
    const { fixture, element } = await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    type(element, '#email', ' admin@inpowered.ai ');
    type(element, '#password', 'Admin@123');
    element.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();

    expect(auth.login).toHaveBeenCalledWith('admin@inpowered.ai', 'Admin@123', false);
    expect(navigate).toHaveBeenCalledWith(['/home']);
  });

  it('shows the API error when the credentials are wrong', async () => {
    auth.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, error: { status: 401, title: 'Unauthorized', detail: 'Invalid email or password.' } })),
    );
    const { fixture, element } = await render();

    type(element, '#email', 'admin@inpowered.ai');
    type(element, '#password', 'wrong');
    element.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();

    expect(element.querySelector('[role=alert]')?.textContent).toContain('Invalid email or password.');
  });
});
