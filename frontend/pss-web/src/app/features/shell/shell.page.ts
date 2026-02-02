import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthFacade } from '../../core/auth/auth.facade';

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
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
})
export class ShellPage {
  private auth = inject(AuthFacade);

  state$ = this.auth.state$ as unknown as import('rxjs').Observable<AuthStateView>;

  hasRole(role: string, roles: string[] | null | undefined): boolean {
    const rolesArr = roles ?? [];
    return rolesArr.includes(role);
  }

  logout(): void {
    this.auth.logout();
  }
}
