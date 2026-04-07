import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiClientService } from '../api/api-client.service';
import { TokenStorageService } from './token-storage.service';

interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  currentUser: {
    userName: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
  };
}

export interface SessionState {
  accessToken: string;
  refreshToken: string;
  userName: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiClient = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly sessionState = new BehaviorSubject<SessionState | null>(this.readSession());

  readonly session$ = this.sessionState.asObservable();

  async login(userNameOrEmail: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.apiClient.post<AuthTokenResponse>('/auth/login', { userNameOrEmail, password })
    );

    const session: SessionState = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      userName: response.data.currentUser.userName,
      email: response.data.currentUser.email,
      fullName: response.data.currentUser.fullName,
      roles: response.data.currentUser.roles,
      permissions: response.data.currentUser.permissions
    };

    this.tokenStorage.set(JSON.stringify(session));
    this.sessionState.next(session);
  }

  logout(): void {
    this.tokenStorage.clear();
    this.sessionState.next(null);
  }

  isAuthenticated(): boolean {
    return this.sessionState.value !== null;
  }

  hasPermission(permission: string): boolean {
    return this.sessionState.value?.permissions.includes(permission) ?? false;
  }

  currentSession(): SessionState | null {
    return this.sessionState.value;
  }

  getFullName(): string {
    return this.sessionState.value?.fullName ?? 'Guest';
  }

  private readSession(): SessionState | null {
    const rawValue = this.tokenStorage.get();

    return rawValue ? JSON.parse(rawValue) as SessionState : null;
  }
}
