import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  NavigationError,
  Router,
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
} from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withNavigationErrorHandler(reloadFailedNavigation)),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};

/**
 * A page's code is downloaded when its route is first opened. If that download fails (e.g. the free Render
 * service went to sleep: only full page requests get its "waking up" page, script requests just fail), the
 * click would do nothing. Loading the URL as a full page instead wakes the server and opens the page.
 * Only after the first navigation, so a page that keeps failing never reloads itself in a loop.
 */
function reloadFailedNavigation(error: NavigationError): void {
  if (inject(Router).navigated) {
    window.location.assign(error.url);
  }
}
