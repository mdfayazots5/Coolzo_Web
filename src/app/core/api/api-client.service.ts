import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../auth/token-storage.service';

type QueryValue = string | number | boolean | null | undefined;

export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly httpClient = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  get<T>(path: string, query: Record<string, QueryValue> = {}): Observable<ApiResponse<T>> {
    return this.httpClient.get<ApiResponse<T>>(`${this.apiBaseUrl}${path}`, {
      headers: this.buildHeaders(),
      params: this.buildParams(query)
    });
  }

  post<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.httpClient.post<ApiResponse<T>>(`${this.apiBaseUrl}${path}`, body, {
      headers: this.buildHeaders()
    });
  }

  put<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.httpClient.put<ApiResponse<T>>(`${this.apiBaseUrl}${path}`, body, {
      headers: this.buildHeaders()
    });
  }

  private buildHeaders(): HttpHeaders {
    const rawSession = this.tokenStorage.get();

    if (!rawSession) {
      return new HttpHeaders();
    }

    const session = JSON.parse(rawSession) as { accessToken?: string };

    return session.accessToken
      ? new HttpHeaders({ Authorization: `Bearer ${session.accessToken}` })
      : new HttpHeaders();
  }

  private buildParams(query: Record<string, QueryValue>): HttpParams {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return params;
  }
}
