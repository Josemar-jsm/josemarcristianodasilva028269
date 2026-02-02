import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginRequest, RefreshRequest, TokenResponse } from '../auth/auth.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  login(req: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.base}/v1/auth/login`, req);
  }

  refresh(req: RefreshRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.base}/v1/auth/refresh`, req);
  }
}
