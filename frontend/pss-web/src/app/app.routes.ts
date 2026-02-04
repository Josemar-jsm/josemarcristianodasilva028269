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

      // ALBUMS
      {
        path: 'albums',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/albums/album-list.page').then(m => m.AlbumListPage),
          },
          {
            path: 'new',
            canActivate: [roleGuard],
            data: { role: 'ROLE_ADMIN' },
            loadComponent: () =>
              import('./features/albums/album-form.page').then(m => m.AlbumFormPage),
          },
          {
            path: ':id/edit',
            canActivate: [roleGuard],
            data: { role: 'ROLE_ADMIN' },
            loadComponent: () =>
              import('./features/albums/album-form.page').then(m => m.AlbumFormPage),
          }
        ]
      },

      // ARTISTS
      {
        path: 'artists',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/artists/artist-list.page').then(m => m.ArtistListPage),
          },
          {
            path: 'new', // Rota estática ANTES da dinâmica :id
            canActivate: [roleGuard],
            data: { role: 'ROLE_ADMIN' },
            loadComponent: () =>
              import('./features/artists/artist-form.page').then(m => m.ArtistFormPage),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/artists/artist-detail.page').then(m => m.ArtistDetailPage),
          },
          {
            path: ':id/edit',
            canActivate: [roleGuard],
            data: { role: 'ROLE_ADMIN' },
            loadComponent: () =>
              import('./features/artists/artist-form.page').then(m => m.ArtistFormPage),
          },
        ]
      },

      // ADMIN AREA
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
