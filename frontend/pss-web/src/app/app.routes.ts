import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.page').then(m => m.LoginPage),
  },

  {
    path: '',
    loadComponent: () =>
      import('./features/shell/shell.page').then(m => m.ShellPage),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'albums',
      },

      {
        path: 'albums',
        loadComponent: () =>
          import('./features/albums/album-list.page').then(m => m.AlbumListPage),
      },

      {
        path: 'artists',
        loadComponent: () =>
          import('./features/artists/artist-list.page').then(m => m.ArtistListPage),
      },
      {
        path: 'artists/:id',
        loadComponent: () =>
          import('./features/artists/artist-detail.page').then(m => m.ArtistDetailPage),
      },

      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { role: 'ROLE_ADMIN' },
        loadComponent: () =>
          import('./features/admin/admin.page').then(m => m.AdminPage),
      },

    ],
  },

  { path: '**', redirectTo: '' },
];
