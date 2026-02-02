import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LoginRequest, RefreshRequest, TokenResponse } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Promise<TokenResponse> {
    const body: LoginRequest = { username, password };
    return firstValueFrom(this.http.post<TokenResponse>('/v1/auth/login', body));
  }

  refresh(refreshToken: string): Promise<TokenResponse> {
    const body: RefreshRequest = { refreshToken };
    return firstValueFrom(this.http.post<TokenResponse>('/v1/auth/refresh', body));
  }
}
