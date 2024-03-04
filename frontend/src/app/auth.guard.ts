import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If the user is not authenticated, redirect to the login page

  let isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
