import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClientService, ApiResponse } from '../../core/api/api-client.service';
import {
  InvoiceDetailResponse,
  InvoiceListItemResponse,
  PagedResult,
  PaymentTransactionResponse,
  QuotationDetailResponse
} from './billing.models';

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private readonly apiClient = inject(ApiClientService);

  getQuotationByJob(jobCardId: number): Promise<QuotationDetailResponse> {
    return this.unwrap(this.apiClient.get<QuotationDetailResponse>(`/quotations/job/${jobCardId}`));
  }

  approveQuotation(quotationId: number, remarks: string): Promise<QuotationDetailResponse> {
    return this.unwrap(this.apiClient.post<QuotationDetailResponse>(`/quotations/${quotationId}/approve`, { remarks }));
  }

  rejectQuotation(quotationId: number, remarks: string): Promise<QuotationDetailResponse> {
    return this.unwrap(this.apiClient.post<QuotationDetailResponse>(`/quotations/${quotationId}/reject`, { remarks }));
  }

  getMyInvoices(pageNumber = 1, pageSize = 20): Promise<PagedResult<InvoiceListItemResponse>> {
    return this.unwrap(this.apiClient.get<PagedResult<InvoiceListItemResponse>>('/invoices/customer', { pageNumber, pageSize }));
  }

  getInvoiceDetail(invoiceId: number): Promise<InvoiceDetailResponse> {
    return this.unwrap(this.apiClient.get<InvoiceDetailResponse>(`/invoices/${invoiceId}`));
  }

  recordPayment(payload: {
    invoiceId: number;
    paidAmount: number;
    paymentMethod: string;
    referenceNumber?: string;
    remarks?: string;
  }): Promise<PaymentTransactionResponse> {
    return this.unwrap(this.apiClient.post<PaymentTransactionResponse>('/payments/collect', payload));
  }

  private async unwrap<T>(observable: Observable<ApiResponse<T>>): Promise<T> {
    const response = await firstValueFrom(observable);
    return response.data;
  }
}
