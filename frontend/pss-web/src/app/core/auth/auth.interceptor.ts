import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthFacade } from './auth.facade';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthFacade) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/v1/auth/')) {
      return next.handle(req);
    }

    const token = this.auth.snapshot().accessToken;
    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((err: any) => {
        if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
          return throwError(() => err);
        }

        return from(this.auth.refreshIfNeeded()).pipe(
          switchMap((refreshed) => {
            if (!refreshed) {
              this.auth.logout();
              return throwError(() => err);
            }

            const newToken = this.auth.snapshot().accessToken;
            const retryReq = newToken
              ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
              : req;

            return next.handle(retryReq);
          }),
          catchError((e) => {
            this.auth.logout();
            return throwError(() => e);
          })
        );
      })
    );
  }
}
