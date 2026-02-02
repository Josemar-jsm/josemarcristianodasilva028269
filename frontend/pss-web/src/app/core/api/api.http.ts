import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from './api.config';

@Injectable({ providedIn: 'root' })
export class ApiHttp {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  get<T>(path: string, params?: Record<string, any>) {
    return this.http.get<T>(this.config.baseUrl + path, {
      params: this.toParams(params),
    });
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(this.config.baseUrl + path, body);
  }

  put<T>(path: string, body: any) {
    return this.http.put<T>(this.config.baseUrl + path, body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.config.baseUrl + path);
  }

  private toParams(params?: Record<string, any>): HttpParams | undefined {
    if (!params) return undefined;

    let p = new HttpParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === '') continue;
      p = p.set(k, String(v));
    }
    return p;
  }
}
