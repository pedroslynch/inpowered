import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Only signed-in users. */
export const authGuard: CanActivateFn = () =>
  inject(AuthService).hasValidSession() || inject(Router).createUrlTree(['/login']);

/** Only visitors; signed-in users go straight to the home page. */
export const guestGuard: CanActivateFn = () =>
  !inject(AuthService).hasValidSession() || inject(Router).createUrlTree(['/home']);
