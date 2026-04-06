import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClientService, ApiResponse } from '../../core/api/api-client.service';
import { LeadResponse } from './lead.models';

@Injectable({ providedIn: 'root' })
export class LeadApiService {
  private readonly apiClient = inject(ApiClientService);

  createLead(payload: Record<string, unknown>): Promise<LeadResponse> {
    return this.unwrap(this.apiClient.post<LeadResponse>('/leads', payload));
  }

  private async unwrap<T>(observable: Observable<ApiResponse<T>>): Promise<T> {
    const response = await firstValueFrom(observable);
    return response.data;
  }
}
