import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClientService, ApiResponse } from '../../core/api/api-client.service';
import {
  AmcPlanResponse,
  CustomerAmcResponse,
  PagedResult,
  RevisitRequestResponse,
  ServiceHistoryItemResponse,
  WarrantyClaimResponse,
  WarrantyStatusResponse
} from './lifecycle.models';

@Injectable({ providedIn: 'root' })
export class LifecycleApiService {
  private readonly apiClient = inject(ApiClientService);

  getPlans(pageNumber = 1, pageSize = 20, isActive = true): Promise<PagedResult<AmcPlanResponse>> {
    return this.unwrap(this.apiClient.get<PagedResult<AmcPlanResponse>>('/amc/plans', { isActive, pageNumber, pageSize }));
  }

  getMyAmc(): Promise<CustomerAmcResponse[]> {
    return this.unwrap(this.apiClient.get<CustomerAmcResponse[]>('/amc/customer/me'));
  }

  getWarrantyByInvoice(invoiceId: number): Promise<WarrantyStatusResponse> {
    return this.unwrap(this.apiClient.get<WarrantyStatusResponse>(`/warranty/invoice/${invoiceId}`));
  }

  createWarrantyClaim(invoiceId: number, claimRemarks: string): Promise<WarrantyClaimResponse> {
    return this.unwrap(this.apiClient.post<WarrantyClaimResponse>('/warranty/claim', { invoiceId, claimRemarks }));
  }

  getRevisitByBooking(bookingId: number): Promise<RevisitRequestResponse[]> {
    return this.unwrap(this.apiClient.get<RevisitRequestResponse[]>(`/revisit/booking/${bookingId}`));
  }

  createRevisit(payload: {
    originalJobCardId: number;
    revisitType: string;
    preferredVisitDateUtc: string | null;
    issueSummary: string;
    requestRemarks: string;
    customerAmcId: number | null;
    warrantyClaimId: number | null;
    chargeAmount: number | null;
  }): Promise<RevisitRequestResponse> {
    return this.unwrap(this.apiClient.post<RevisitRequestResponse>('/revisit/request', payload));
  }

  getMyServiceHistory(): Promise<ServiceHistoryItemResponse[]> {
    return this.unwrap(this.apiClient.get<ServiceHistoryItemResponse[]>('/service-history/me'));
  }

  private async unwrap<T>(observable: Observable<ApiResponse<T>>): Promise<T> {
    const response = await firstValueFrom(observable);
    return response.data;
  }
}
