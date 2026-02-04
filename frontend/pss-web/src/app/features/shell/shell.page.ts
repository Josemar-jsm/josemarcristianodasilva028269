import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

import { AuthFacade } from '../../core/auth/auth.facade';
import { Observable } from 'rxjs';

type AuthStateView = {
  isAuthenticated: boolean;
  username: string | null;
  roles: string[];
};

@Component({
  selector: 'app-shell',
  standalone: true,
  templateUrl: './shell.page.html',
  imports: [
    AsyncPipe,
    NgIf,
    NgFor,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
})
export class ShellPage {
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);

  state$ = this.auth.state$ as Observable<AuthStateView>;

  hasRole(role: string, roles: string[] | null | undefined): boolean {
    return (roles ?? []).includes(role);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
