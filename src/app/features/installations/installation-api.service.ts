import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClientService, ApiResponse } from '../../core/api/api-client.service';
import {
  InstallationDetailResponse,
  InstallationListItemResponse,
  InstallationSummaryResponse,
  PagedResult
} from './installation.models';

@Injectable({ providedIn: 'root' })
export class InstallationApiService {
  private readonly apiClient = inject(ApiClientService);

  createInstallation(payload: Record<string, unknown>): Promise<InstallationSummaryResponse> {
    return this.unwrap(this.apiClient.post<InstallationSummaryResponse>('/installations', payload));
  }

  listInstallations(query: Record<string, string | number | null | undefined>): Promise<PagedResult<InstallationListItemResponse>> {
    return this.unwrap(this.apiClient.get<PagedResult<InstallationListItemResponse>>('/installations', query));
  }

  getInstallationDetail(installationId: number): Promise<InstallationDetailResponse> {
    return this.unwrap(this.apiClient.get<InstallationDetailResponse>(`/installations/${installationId}`));
  }

  approveProposal(installationId: number, customerRemarks: string): Promise<InstallationSummaryResponse> {
    return this.unwrap(this.apiClient.post<InstallationSummaryResponse>(`/installations/${installationId}/proposal/approve`, { customerRemarks }));
  }

  rejectProposal(installationId: number, customerRemarks: string): Promise<InstallationSummaryResponse> {
    return this.unwrap(this.apiClient.post<InstallationSummaryResponse>(`/installations/${installationId}/proposal/reject`, { customerRemarks }));
  }

  private async unwrap<T>(observable: Observable<ApiResponse<T>>): Promise<T> {
    const response = await firstValueFrom(observable);
    return response.data;
  }
}
