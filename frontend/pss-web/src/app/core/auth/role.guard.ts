import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthFacade } from './auth.facade';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthFacade);
  const router = inject(Router);

  const required = (route.data['role'] as string) ?? '';

  return auth.state$.pipe(
    map(s => {
      const roles = s.roles ?? [];
      if (required && roles.includes(required)) return true;
      return router.createUrlTree(['/']);
    })
  );
};
