import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClientService, ApiResponse } from '../../core/api/api-client.service';
import {
  CreateSupportTicketPayload,
  LookupItemResponse,
  PagedResult,
  SupportTicketDetailResponse,
  SupportTicketListItemResponse,
  SupportTicketReplyResponse
} from './support.models';

@Injectable({ providedIn: 'root' })
export class SupportApiService {
  private readonly apiClient = inject(ApiClientService);

  getCategories(): Promise<LookupItemResponse[]> {
    return this.unwrap(this.apiClient.get<LookupItemResponse[]>('/support-ticket-lookups/categories'));
  }

  getPriorities(): Promise<LookupItemResponse[]> {
    return this.unwrap(this.apiClient.get<LookupItemResponse[]>('/support-ticket-lookups/priorities'));
  }

  getMyTickets(pageNumber = 1, pageSize = 20): Promise<PagedResult<SupportTicketListItemResponse>> {
    return this.unwrap(this.apiClient.get<PagedResult<SupportTicketListItemResponse>>('/support-tickets/my-tickets', { pageNumber, pageSize }));
  }

  getTicketDetail(supportTicketId: number): Promise<SupportTicketDetailResponse> {
    return this.unwrap(this.apiClient.get<SupportTicketDetailResponse>(`/support-tickets/${supportTicketId}`));
  }

  createTicket(payload: CreateSupportTicketPayload): Promise<SupportTicketDetailResponse> {
    return this.unwrap(this.apiClient.post<SupportTicketDetailResponse>('/support-tickets', payload));
  }

  addReply(supportTicketId: number, replyText: string): Promise<SupportTicketReplyResponse> {
    return this.unwrap(this.apiClient.post<SupportTicketReplyResponse>(`/support-tickets/${supportTicketId}/replies`, { replyText, isInternalOnly: false }));
  }

  closeTicket(supportTicketId: number, remarks: string): Promise<SupportTicketDetailResponse> {
    return this.unwrap(this.apiClient.post<SupportTicketDetailResponse>(`/support-tickets/${supportTicketId}/close`, { remarks }));
  }

  reopenTicket(supportTicketId: number, remarks: string): Promise<SupportTicketDetailResponse> {
    return this.unwrap(this.apiClient.post<SupportTicketDetailResponse>(`/support-tickets/${supportTicketId}/reopen`, { remarks }));
  }

  private async unwrap<T>(observable: Observable<ApiResponse<T>>): Promise<T> {
    const response = await firstValueFrom(observable);
    return response.data;
  }
}
