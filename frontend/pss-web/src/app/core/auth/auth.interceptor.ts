import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthFacade } from './auth.facade';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthFacade);
  const token = auth.snapshot().accessToken;

  const isAuthEndpoint =
    req.url.includes('/v1/auth/login') || req.url.includes('/v1/auth/refresh');

  if (!token || isAuthEndpoint) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};
