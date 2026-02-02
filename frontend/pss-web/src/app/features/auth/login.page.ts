import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md rounded-xl border p-6 shadow-sm">
      <h1 class="text-2xl font-semibold mb-1">Login</h1>
      <p class="text-sm text-gray-600 mb-6">Entre para acessar o sistema.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Usuário</label>
          <input class="w-full rounded-lg border px-3 py-2"
                 formControlName="username" autocomplete="username" />
          <div class="text-xs text-red-600 mt-1"
               *ngIf="form.controls.username.touched && form.controls.username.invalid">
            Informe um usuário válido.
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Senha</label>
          <input type="password" class="w-full rounded-lg border px-3 py-2"
                 formControlName="password" autocomplete="current-password" />
          <div class="text-xs text-red-600 mt-1"
               *ngIf="form.controls.password.touched && form.controls.password.invalid">
            Informe uma senha válida.
          </div>
        </div>

        <div *ngIf="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ error }}
        </div>

        <button class="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
                [disabled]="loading" type="submit">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
  `
})
export class LoginPage {
  loading = false;
  error: string | null = null;

  form;

  constructor(
    private fb: FormBuilder,
    private auth: AuthFacade,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  async submit() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    try {
      const { username, password } = this.form.getRawValue();
      await this.auth.login(username!, password!);
      await this.router.navigateByUrl('/');
    } catch (e: any) {
      this.error = e?.error?.detail ?? e?.message ?? 'Falha no login';
    } finally {
      this.loading = false;
    }
  }
}
