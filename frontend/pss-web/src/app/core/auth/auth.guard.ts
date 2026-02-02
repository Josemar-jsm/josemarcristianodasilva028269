import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthFacade } from './auth.facade';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);

  return auth.state$.pipe(
    map(s => {
      if (s.isAuthenticated) return true;
      return router.createUrlTree(['/login']);
    })
  );
};
