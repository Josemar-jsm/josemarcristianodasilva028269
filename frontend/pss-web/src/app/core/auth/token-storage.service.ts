import { Injectable } from '@angular/core';
import { AuthState } from './auth.models';

const KEY = 'pss_auth_state_v1';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  load(): AuthState | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthState;
    } catch {
      return null;
    }
  }

  save(state: AuthState): void {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  clear(): void {
    localStorage.removeItem(KEY);
  }
}
