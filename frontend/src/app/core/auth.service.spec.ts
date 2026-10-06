import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ADMIN, SELLER, loginResponse } from '../testing/fixtures';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let http: HttpTestingController;

  function setup(): AuthService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => http.verify());

  it('signs in and exposes the user and token', () => {
    const auth = setup();
    let signedIn = false;
    auth.login('admin@inpowered.ai', 'Admin@123', false).subscribe(() => (signedIn = true));

    const request = http.expectOne('/api/auth/login');
    expect(request.request.body).toEqual({ email: 'admin@inpowered.ai', password: 'Admin@123' });
    request.flush(loginResponse(ADMIN));

    expect(signedIn).toBe(true);
    expect(auth.user()).toEqual(ADMIN);
    expect(auth.isAdmin()).toBe(true);
    expect(auth.token()).toBe('token-1');
    expect(sessionStorage.getItem('inpowered.session')).not.toBeNull();
    expect(localStorage.getItem('inpowered.session')).toBeNull();
  });

  it('keeps the session in localStorage when "keep me signed in" is checked', () => {
    const auth = setup();
    auth.login('maria.silva@inpowered.ai', 'Seller@123', true).subscribe();
    http.expectOne('/api/auth/login').flush(loginResponse(SELLER));

    expect(localStorage.getItem('inpowered.session')).not.toBeNull();
    expect(auth.isAdmin()).toBe(false);
  });

  it('restores a stored session and drops an expired one', () => {
    localStorage.setItem('inpowered.session', JSON.stringify(loginResponse(SELLER)));
    expect(setup().user()).toEqual(SELLER);

    TestBed.resetTestingModule();
    localStorage.setItem('inpowered.session', JSON.stringify(loginResponse(SELLER, -1000)));
    const auth = setup();
    expect(auth.user()).toBeNull();
    expect(auth.hasValidSession()).toBe(false);
    expect(localStorage.getItem('inpowered.session')).toBeNull();
  });

  it('signs out and goes back to the login page', () => {
    localStorage.setItem('inpowered.session', JSON.stringify(loginResponse(ADMIN)));
    const auth = setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    auth.logout('expired');

    expect(auth.user()).toBeNull();
    expect(localStorage.getItem('inpowered.session')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { reason: 'expired' } });
  });
});
