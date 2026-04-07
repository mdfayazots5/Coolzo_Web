export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface AmcPlanResponse {
  amcPlanId: number;
  planName: string;
  planDescription: string;
  durationInMonths: number;
  visitCount: number;
  priceAmount: number;
  isActive: boolean;
  termsAndConditions: string;
}

export interface AmcVisitScheduleResponse {
  amcVisitScheduleId: number;
  visitNumber: number;
  scheduledDate: string;
  currentStatus: string;
  serviceRequestId: number | null;
  serviceRequestNumber: string | null;
  completedDateUtc: string | null;
  visitRemarks: string;
}

export interface CustomerAmcResponse {
  customerAmcId: number;
  customerId: number;
  customerName: string;
  amcPlanId: number;
  planName: string;
  jobCardId: number;
  jobCardNumber: string;
  invoiceId: number;
  invoiceNumber: string;
  currentStatus: string;
  startDateUtc: string;
  endDateUtc: string;
  totalVisitCount: number;
  consumedVisitCount: number;
  priceAmount: number;
  visits: AmcVisitScheduleResponse[];
}

export interface WarrantyClaimResponse {
  warrantyClaimId: number;
  invoiceId: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  warrantyRuleId: number | null;
  warrantyRuleName: string | null;
  coverageStartDateUtc: string;
  coverageEndDateUtc: string;
  isEligible: boolean;
  currentStatus: string;
  serviceName: string;
  claimRemarks: string;
  claimDateUtc: string;
  revisitRequestId: number | null;
}

export interface WarrantyStatusResponse {
  invoiceId: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  serviceName: string;
  isWarrantyAvailable: boolean;
  isEligible: boolean;
  eligibilityMessage: string;
  coverageStartDateUtc: string | null;
  coverageEndDateUtc: string | null;
  warrantyRuleName: string | null;
  claims: WarrantyClaimResponse[];
}

export interface RevisitRequestResponse {
  revisitRequestId: number;
  bookingId: number;
  bookingReference: string;
  customerId: number;
  customerName: string;
  originalJobCardId: number;
  originalJobCardNumber: string;
  revisitType: string;
  currentStatus: string;
  requestedDateUtc: string;
  preferredVisitDateUtc: string | null;
  issueSummary: string;
  requestRemarks: string;
  chargeAmount: number;
  customerAmcId: number | null;
  warrantyClaimId: number | null;
}

export interface ServiceHistoryItemResponse {
  historyType: string;
  referenceNumber: string;
  title: string;
  status: string;
  eventDateUtc: string;
  detail: string;
  amount: number | null;
  bookingId: number | null;
  serviceRequestId: number | null;
  jobCardId: number | null;
  invoiceId: number | null;
  customerAmcId: number | null;
  revisitRequestId: number | null;
}
