import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClientService, ApiResponse } from '../../core/api/api-client.service';
import {
  CMSBlockResponse,
  CMSFaqResponse,
  CommunicationPreferenceResponse,
  PublicHomeCMSContentResponse
} from './content.models';

@Injectable({ providedIn: 'root' })
export class ContentApiService {
  private readonly apiClient = inject(ApiClientService);

  getPublicHome(): Promise<PublicHomeCMSContentResponse> {
    return this.unwrap(this.apiClient.get<PublicHomeCMSContentResponse>('/cms/public/home'));
  }

  getPublicFaqs(): Promise<CMSFaqResponse[]> {
    return this.unwrap(this.apiClient.get<CMSFaqResponse[]>('/cms/public/faqs'));
  }

  getPublicServiceContent(key: string): Promise<CMSBlockResponse> {
    return this.unwrap(this.apiClient.get<CMSBlockResponse>(`/cms/public/service-content/${key}`));
  }

  getMyCommunicationPreference(): Promise<CommunicationPreferenceResponse> {
    return this.unwrap(this.apiClient.get<CommunicationPreferenceResponse>('/communication-preferences/me'));
  }

  updateMyCommunicationPreference(payload: Record<string, unknown>): Promise<CommunicationPreferenceResponse> {
    return this.unwrap(this.apiClient.put<CommunicationPreferenceResponse>('/communication-preferences/me', payload));
  }

  private async unwrap<T>(observable: Observable<ApiResponse<T>>): Promise<T> {
    const response = await firstValueFrom(observable);
    return response.data;
  }
}
