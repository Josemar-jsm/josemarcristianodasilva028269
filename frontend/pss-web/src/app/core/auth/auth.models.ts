export interface TokenResponse {
  tokenType: string;
  accessToken: string;
  accessExpiresInSeconds: number;
  refreshToken: string;
  refreshExpiresInSeconds: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  roles: string[];
  accessToken: string | null;
  refreshToken: string | null;
  accessExpiresAt: number | null;
  refreshExpiresAt: number | null;
}
export const EMPTY_AUTH: AuthState = {
  isAuthenticated: false,
  username: null,
  roles: [],
  accessToken: null,
  refreshToken: null,
  accessExpiresAt: null,
  refreshExpiresAt: null,
};
