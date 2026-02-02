import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthFacade } from './auth.facade';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthFacade, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const roles = (route.data['roles'] as string[] | undefined) ?? [];

    if (!this.auth.isLogged()) return this.router.parseUrl('/login');
    const ok = roles.length === 0 || roles.some(r => this.auth.hasRole(r));
    return ok ? true : this.router.parseUrl('/');
  }
}
