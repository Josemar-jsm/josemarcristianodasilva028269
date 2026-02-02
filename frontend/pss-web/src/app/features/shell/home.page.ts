import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="p-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Home</h1>
      <button class="rounded-lg border px-3 py-2" (click)="logout()">Sair</button>
    </div>

    <div class="rounded-xl border p-4">
      <div class="text-sm text-gray-600">Usuário</div>
      <div class="text-lg font-medium">{{ (username$ | async) ?? '(desconhecido)' }}</div>

      <div class="mt-4 text-sm text-gray-600">Roles</div>
      <div class="text-base">{{ (roles$ | async) ?? '(sem roles)' }}</div>
    </div>
  </div>
  `
})
export class HomePage {
  username$;
  roles$;

  constructor(private auth: AuthFacade, private router: Router) {
    this.username$ = this.auth.state$.pipe(map(s => s.username));
    this.roles$ = this.auth.state$.pipe(map(s => (s.roles ?? []).join(', ') || '(sem roles)'));
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
