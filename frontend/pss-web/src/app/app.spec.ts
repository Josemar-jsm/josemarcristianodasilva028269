import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LoginPage } from './features/auth/login.page';
import { HomePage } from './features/shell/home.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: '', component: HomePage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
