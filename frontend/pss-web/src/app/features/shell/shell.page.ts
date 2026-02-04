import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

import { AuthFacade } from '../../core/auth/auth.facade';
import { Observable } from 'rxjs';
import { ToastCenterComponent } from './toast-center.component';

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
    ToastCenterComponent
  ],
})
export class ShellPage {
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);

  readonly state$: Observable<any> = this.auth.state$;

  hasRole(role: string, roles: string[] | null | undefined): boolean {
    return !!roles?.includes(role);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
