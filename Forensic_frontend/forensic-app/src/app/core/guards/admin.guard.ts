import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUserValue;

  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (user.role !== 'admin') {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};