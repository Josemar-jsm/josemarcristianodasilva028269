import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/shell/home.page').then(m => m.HomePage),
  },
  { path: '**', redirectTo: '' },
];
