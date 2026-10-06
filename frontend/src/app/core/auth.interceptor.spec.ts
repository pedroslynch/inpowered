import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ADMIN, loginResponse } from '../testing/fixtures';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.setItem('inpowered.session', JSON.stringify(loginResponse(ADMIN)));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
  });

  it('adds the bearer token to API calls only', () => {
    http.get('/api/sales').subscribe();
    http.get('/assets/config.json').subscribe();

    expect(backend.expectOne('/api/sales').request.headers.get('Authorization')).toBe('Bearer token-1');
    expect(backend.expectOne('/assets/config.json').request.headers.has('Authorization')).toBe(false);
  });

  it('signs the user out when the API answers 401', () => {
    const logout = vi.spyOn(TestBed.inject(AuthService), 'logout').mockImplementation(() => undefined);
    http.get('/api/sales').subscribe({ error: () => undefined });

    backend.expectOne('/api/sales').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(logout).toHaveBeenCalledWith('expired');
  });
});
