import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { LoginResponse, User } from './models';

const STORAGE_KEY = 'inpowered.session';

interface Session {
  token: string;
  expiresAt: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<Session | null>(restoreSession());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  /**
   * Signs in and stores the session. With `remember` the session survives closing the
   * browser (localStorage); otherwise it lasts for the tab (sessionStorage).
   */
  login(email: string, password: string, remember: boolean): Observable<User> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      map(({ token, expiresAt, user }) => {
        const session: Session = { token, expiresAt, user };
        clearStoredSession();
        writeStorage(remember ? 'local' : 'session', JSON.stringify(session));
        this.session.set(session);
        return user;
      }),
    );
  }

  /** Current token, or null when there is no session or it has expired. */
  token(): string | null {
    return this.hasValidSession() ? this.session()!.token : null;
  }

  hasValidSession(): boolean {
    const session = this.session();
    if (session && !isExpired(session)) {
      return true;
    }
    if (session) {
      this.clear();
    }
    return false;
  }

  /**
   * Ends the session. Signing out opens the landing page, where the user can sign in again when they
   * want; an expired session goes to the login page with a notice.
   */
  logout(reason?: 'expired'): void {
    this.clear();
    if (reason) {
      this.router.navigate(['/login'], { queryParams: { reason } });
    } else {
      this.router.navigate(['/']);
    }
  }

  private clear(): void {
    clearStoredSession();
    this.session.set(null);
  }
}

function isExpired(session: Session): boolean {
  return new Date(session.expiresAt).getTime() <= Date.now();
}

function storage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function writeStorage(kind: 'local' | 'session', value: string): void {
  try {
    storage(kind)?.setItem(STORAGE_KEY, value);
  } catch {
    // Storage unavailable (private mode, blocked): the session lives in memory only.
  }
}

function clearStoredSession(): void {
  for (const kind of ['local', 'session'] as const) {
    try {
      storage(kind)?.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
  }
}

function restoreSession(): Session | null {
  for (const kind of ['local', 'session'] as const) {
    try {
      const raw = storage(kind)?.getItem(STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw) as Session;
        if (session?.token && !isExpired(session)) {
          return session;
        }
        storage(kind)?.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore corrupted or inaccessible storage.
    }
  }
  return null;
}
