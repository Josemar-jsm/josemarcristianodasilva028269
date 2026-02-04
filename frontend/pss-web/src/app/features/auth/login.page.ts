import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center p-6 bg-slate-50">
    <div class="w-full max-w-md rounded-3xl border bg-white p-10 shadow-2xl shadow-slate-200 border-slate-100">

      <header class="mb-10 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4 transform -rotate-3">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>

        <h1 class="text-3xl font-black tracking-tighter text-slate-900">
          Tambor de Cururu
        </h1>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 mt-2">
          Sistema de gerenciamento de artistas e álbuns
        </p>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
        <div>
          <label for="username" class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Usuário</label>
          <input id="username" type="text"
                 class="w-full rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all px-5 py-4 outline-none text-slate-900 font-medium"
                 placeholder="Seu nome de usuário"
                 formControlName="username" autocomplete="username" />
        </div>

        <div>
          <label for="password" class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Senha</label>
          <input id="password" type="password"
                 class="w-full rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all px-5 py-4 outline-none text-slate-900 font-medium"
                 placeholder="••••••••"
                 formControlName="password" autocomplete="current-password" />
        </div>

        <div *ngIf="errorMessage()" role="alert"
             class="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 font-medium animate-in fade-in zoom-in duration-300">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            <span>Vôte! {{ errorMessage() }}</span>
          </div>
        </div>

        <button type="submit"
                [disabled]="isLoading() || form.invalid"
                class="w-full rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white py-4 font-bold tracking-wide shadow-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
          {{ isLoading() ? 'Esquentando o couro...' : 'Entrar no Sistema' }}
        </button>
      </form>

      <footer class="mt-10 text-center">
        <p class="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase">
          É de Lás, Cuiabá - MT
        </p>
      </footer>
    </div>
  </div>
  `
})
export class LoginPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const { username, password } = this.form.getRawValue();
      await this.auth.login(username, password);
      await this.router.navigateByUrl('/');
    } catch (e: any) {
      const message = e?.error?.detail || e?.message || 'Deu moage no login';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
