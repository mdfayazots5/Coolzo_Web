import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClientService, ApiResponse } from '../../core/api/api-client.service';
import {
  CancellationDetailResponse,
  CancellationOptionsResponse,
  RefundDetailResponse
} from './cancellation.models';

@Injectable({ providedIn: 'root' })
export class CancellationApiService {
  private readonly apiClient = inject(ApiClientService);

  getCancellationOptions(serviceRequestId: number, bookingId?: number): Promise<CancellationOptionsResponse> {
    return this.unwrap(this.apiClient.get<CancellationOptionsResponse>(`/cancellations/options/${serviceRequestId}`, { bookingId }));
  }

  getCancellationByBooking(bookingId: number, serviceRequestId?: number): Promise<CancellationDetailResponse | null> {
    return this.unwrap(this.apiClient.get<CancellationDetailResponse[]>(`/cancellations`, { bookingId, serviceRequestId }))
      .then((items) => items[0] ?? null);
  }

  createCustomerCancellation(payload: {
    bookingId: number;
    serviceRequestId: number | null;
    cancellationReasonCode: string;
    cancellationReasonText: string;
  }): Promise<CancellationDetailResponse> {
    return this.unwrap(this.apiClient.post<CancellationDetailResponse>('/cancellations/customer', payload));
  }

  getRefundDetail(refundRequestId: number): Promise<RefundDetailResponse> {
    return this.unwrap(this.apiClient.get<RefundDetailResponse>(`/refunds/${refundRequestId}`));
  }

  private async unwrap<T>(observable: Observable<ApiResponse<T>>): Promise<T> {
    const response = await firstValueFrom(observable);
    return response.data;
  }
}
