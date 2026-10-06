import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblem } from './models';

/** Turns any HTTP error into a message that can be shown to the user. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.';
    }
    const problem = error.error as Partial<ApiProblem> | null;
    if (problem?.detail) {
      return problem.detail;
    }
  }
  return fallback;
}

export function fieldErrors(error: unknown): Record<string, string> {
  if (error instanceof HttpErrorResponse) {
    return (error.error as Partial<ApiProblem> | null)?.errors ?? {};
  }
  return {};
}
