import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClientService, ApiResponse } from '../../core/api/api-client.service';
import {
  AcTypeLookupResponse,
  BookingDetailResponse,
  BookingListItemResponse,
  BookingSummaryResponse,
  BrandLookupResponse,
  PagedResult,
  ServiceCategoryLookupResponse,
  ServiceLookupResponse,
  SlotAvailabilityResponse,
  TonnageLookupResponse,
  ZoneLookupResponse
} from './booking.models';

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly apiClient = inject(ApiClientService);

  getServiceCategories(): Promise<ServiceCategoryLookupResponse[]> {
    return this.unwrap(this.apiClient.get<ServiceCategoryLookupResponse[]>('/booking-lookups/service-categories'));
  }

  getServices(serviceCategoryId: number): Promise<ServiceLookupResponse[]> {
    return this.unwrap(this.apiClient.get<ServiceLookupResponse[]>('/booking-lookups/services', { serviceCategoryId }));
  }

  getAcTypes(): Promise<AcTypeLookupResponse[]> {
    return this.unwrap(this.apiClient.get<AcTypeLookupResponse[]>('/booking-lookups/ac-types'));
  }

  getTonnages(): Promise<TonnageLookupResponse[]> {
    return this.unwrap(this.apiClient.get<TonnageLookupResponse[]>('/booking-lookups/tonnage'));
  }

  getBrands(): Promise<BrandLookupResponse[]> {
    return this.unwrap(this.apiClient.get<BrandLookupResponse[]>('/booking-lookups/brands'));
  }

  resolveZone(pincode: string): Promise<ZoneLookupResponse> {
    return this.unwrap(this.apiClient.get<ZoneLookupResponse>(`/booking-lookups/zones/by-pincode/${pincode}`));
  }

  getSlots(zoneId: number, slotDate: string): Promise<SlotAvailabilityResponse[]> {
    return this.unwrap(this.apiClient.get<SlotAvailabilityResponse[]>('/booking-lookups/slots', { zoneId, slotDate }));
  }

  createGuestBooking(payload: Record<string, unknown>): Promise<BookingSummaryResponse> {
    return this.unwrap(this.apiClient.post<BookingSummaryResponse>('/bookings/guest', payload));
  }

  createCustomerBooking(payload: Record<string, unknown>): Promise<BookingSummaryResponse> {
    return this.unwrap(this.apiClient.post<BookingSummaryResponse>('/bookings/customer', payload));
  }

  getMyBookings(pageNumber = 1, pageSize = 20): Promise<PagedResult<BookingListItemResponse>> {
    return this.unwrap(this.apiClient.get<PagedResult<BookingListItemResponse>>('/customer-bookings', { pageNumber, pageSize }));
  }

  getBookingDetail(bookingId: number): Promise<BookingDetailResponse> {
    return this.unwrap(this.apiClient.get<BookingDetailResponse>(`/customer-bookings/${bookingId}`));
  }

  private async unwrap<T>(observable: Observable<ApiResponse<T>>): Promise<T> {
    const response = await firstValueFrom(observable);
    return response.data;
  }
}
