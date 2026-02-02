import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthFacade } from './auth.facade';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthFacade, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.auth.isLogged()) return true;
    return this.router.parseUrl('/login');
  }
}
