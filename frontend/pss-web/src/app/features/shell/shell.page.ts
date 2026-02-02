import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './shell.page.html',
})
export class ShellPage {
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);

  username$ = this.auth.state$.pipe(map(s => s.username ?? '(desconhecido)'));
  roles$ = this.auth.state$.pipe(map(s => s.roles ?? []));

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
