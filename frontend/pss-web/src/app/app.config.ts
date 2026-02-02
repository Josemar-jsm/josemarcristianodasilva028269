import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

import { authInterceptor } from './core/auth/auth.interceptor';
import { API_CONFIG } from './core/api/api.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_CONFIG, useValue: { baseUrl: 'http://localhost:8080' } },
  ],
};
