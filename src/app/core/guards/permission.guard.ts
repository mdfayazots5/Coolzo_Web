import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const permission = route.data['permission'] as string;

  return authService.hasPermission(permission) ? true : router.createUrlTree(['/forbidden']);
};
