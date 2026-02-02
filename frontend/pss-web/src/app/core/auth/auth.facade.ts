import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { AuthState, EMPTY_AUTH, TokenResponse } from './auth.models';
import { TokenStorageService } from './token-storage.service';
import { parseJwtClaims } from './jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly stateSubject: BehaviorSubject<AuthState>;
  readonly state$;

  constructor(
    private api: AuthApiService,
    private storage: TokenStorageService
  ) {
    const initial = this.storage.load() ?? EMPTY_AUTH;
    this.stateSubject = new BehaviorSubject<AuthState>(initial);
    this.state$ = this.stateSubject.asObservable();
  }

  snapshot(): AuthState {
    return this.stateSubject.value;
  }

  isLogged(): boolean {
    const s = this.snapshot();
    return !!s.isAuthenticated && !!s.accessToken;
  }

  hasRole(role: string): boolean {
    const roles = this.snapshot().roles ?? [];
    const normalized = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return roles.includes(normalized) || roles.includes(role);
  }

  logout(): void {
    this.stateSubject.next(EMPTY_AUTH);
    this.storage.clear();
  }

  private applyTokens(token: TokenResponse): AuthState {
    const now = Date.now();
    const accessExpiresAt = now + token.accessExpiresInSeconds * 1000;
    const refreshExpiresAt = now + token.refreshExpiresInSeconds * 1000;

    const claims = parseJwtClaims(token.accessToken);
    const username = claims?.sub ?? null;

    const rolesRaw = (claims?.roles ?? []) as string[];
    const roles = rolesRaw.map(r => (r.startsWith('ROLE_') ? r : `ROLE_${r}`));

    return {
      isAuthenticated: true,
      username,
      roles,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
    };
  }

  async login(username: string, password: string): Promise<void> {
    const token = await this.api.login(username, password);
    const next = this.applyTokens(token);
    this.stateSubject.next(next);
    this.storage.save(next);
  }

  shouldRefreshSoon(ms = 20_000): boolean {
    const s = this.snapshot();
    if (!s.refreshToken || !s.refreshExpiresAt) return false;
    if (!s.accessExpiresAt) return false;
    return s.accessExpiresAt - Date.now() <= ms;
  }

  async refreshIfNeeded(): Promise<boolean> {
    const s = this.snapshot();

    if (!s.refreshToken || !s.refreshExpiresAt) return false;
    if (Date.now() >= s.refreshExpiresAt) {
      this.logout();
      return false;
    }

    const accessExpired = !s.accessExpiresAt || Date.now() >= s.accessExpiresAt;
    const accessSoon = this.shouldRefreshSoon();

    if (accessExpired || accessSoon) {
      const token = await this.api.refresh(s.refreshToken);
      const next = this.applyTokens(token);
      this.stateSubject.next(next);
      this.storage.save(next);
      return true;
    }

    return false;
  }
}
