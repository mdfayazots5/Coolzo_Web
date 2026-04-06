import { Injectable } from '@angular/core';

const sessionStorageKey = 'coolzo-web-session';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  get(): string | null {
    return localStorage.getItem(sessionStorageKey);
  }

  set(value: string): void {
    localStorage.setItem(sessionStorageKey, value);
  }

  clear(): void {
    localStorage.removeItem(sessionStorageKey);
  }
}
