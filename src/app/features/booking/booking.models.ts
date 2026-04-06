export interface ServiceCategoryLookupResponse {
  serviceCategoryId: number;
  categoryName: string;
  description: string;
}

export interface ServiceLookupResponse {
  serviceId: number;
  serviceCategoryId: number;
  serviceName: string;
  summary: string;
  basePrice: number;
  pricingModelName: string;
}

export interface AcTypeLookupResponse {
  acTypeId: number;
  acTypeName: string;
  description: string;
}

export interface TonnageLookupResponse {
  tonnageId: number;
  tonnageName: string;
  description: string;
}

export interface BrandLookupResponse {
  brandId: number;
  brandName: string;
  description: string;
}

export interface ZoneLookupResponse {
  zoneId: number;
  zoneName: string;
  cityName: string;
  pincode: string;
}

export interface SlotAvailabilityResponse {
  slotAvailabilityId: number;
  zoneId: number;
  slotDate: string;
  slotLabel: string;
  startTime: string;
  endTime: string;
  availableCapacity: number;
  reservedCapacity: number;
  isAvailable: boolean;
}

export interface BookingSummaryResponse {
  bookingId: number;
  bookingReference: string;
  status: string;
  serviceName: string;
  customerName: string;
  mobileNumber: string;
  slotDate: string;
  slotLabel: string;
  addressSummary: string;
  estimatedPrice: number;
}

export interface BookingListItemResponse {
  bookingId: number;
  bookingReference: string;
  status: string;
  serviceName: string;
  customerName: string;
  mobileNumber: string;
  slotDate: string;
  slotLabel: string;
  sourceChannel: string;
  bookingDateUtc: string;
  operationalStatus: string | null;
  assignedTechnicianName: string | null;
}

export interface BookingLineResponse {
  serviceName: string;
  acTypeName: string;
  tonnageName: string;
  brandName: string;
  modelName: string;
  issueNotes: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface BookingStatusHistoryResponse {
  status: string;
  remarks: string;
  statusDateUtc: string;
}

export interface JobExecutionTimelineItemResponse {
  eventType: string;
  eventTitle: string;
  status: string;
  remarks: string;
  eventDateUtc: string;
}

export interface JobExecutionNoteResponse {
  jobExecutionNoteId: number;
  noteText: string;
  isCustomerVisible: boolean;
  createdBy: string;
  noteDateUtc: string;
}

export interface BookingDetailResponse {
  bookingId: number;
  bookingReference: string;
  status: string;
  sourceChannel: string;
  isGuestBooking: boolean;
  bookingDateUtc: string;
  serviceName: string;
  customerName: string;
  mobileNumber: string;
  emailAddress: string;
  addressSummary: string;
  zoneName: string;
  slotDate: string;
  slotLabel: string;
  estimatedPrice: number;
  serviceRequestId: number | null;
  serviceRequestNumber: string | null;
  operationalStatus: string | null;
  assignedTechnicianId: number | null;
  assignedTechnicianName: string | null;
  jobCardId: number | null;
  jobCardNumber: string | null;
  quotationId: number | null;
  quotationNumber: string | null;
  quotationStatus: string | null;
  invoiceId: number | null;
  invoiceNumber: string | null;
  invoiceStatus: string | null;
  invoiceGrandTotalAmount: number | null;
  invoiceBalanceAmount: number | null;
  completionSummary: string | null;
  fieldTimeline: JobExecutionTimelineItemResponse[];
  customerVisibleNotes: JobExecutionNoteResponse[];
  lines: BookingLineResponse[];
  statusHistory: BookingStatusHistoryResponse[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
