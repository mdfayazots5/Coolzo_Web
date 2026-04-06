export interface CancellationOptionsResponse {
  bookingId: number | null;
  serviceRequestId: number | null;
  policyCode: string;
  policyName: string;
  policyDescription: string;
  timeToSlotMinutes: number;
  paidAmount: number;
  cancellationFee: number;
  refundEligibleAmount: number;
  approvalRequired: boolean;
  canCustomerCancel: boolean;
  customerDenialReason: string;
  scheduledStartUtc: string;
  isTechnicianDispatched: boolean;
}

export interface CancellationDetailResponse {
  cancellationRecordId: number;
  bookingId: number | null;
  serviceRequestId: number | null;
  cancelledByUserId: number | null;
  cancelledByRole: string;
  cancellationSource: string;
  cancellationReasonCode: string;
  cancellationReasonText: string;
  timeToSlotMinutes: number;
  cancellationFee: number;
  refundEligibleAmount: number;
  cancellationStatus: string;
  policyCode: string;
  policyDescription: string;
  approvalRequired: boolean;
  dateCreated: string;
  refundRequestId: number | null;
  refundStatus: string | null;
}

export interface RefundApprovalHistoryResponse {
  refundApprovalId: number;
  approvalLevel: number;
  approverUserId: number;
  approvalStatus: string;
  approvalRemarks: string;
  approvedOn: string | null;
}

export interface RefundStatusHistoryResponse {
  refundStatusHistoryId: number;
  fromStatus: string;
  toStatus: string;
  changedByUserId: number;
  changedOn: string;
  remarks: string;
}

export interface RefundDetailResponse {
  refundRequestId: number;
  refundRequestNo: string;
  cancellationRecordId: number | null;
  invoiceId: number | null;
  paymentTransactionId: number | null;
  refundAmount: number;
  requestedAmount: number;
  approvedAmount: number;
  maxAllowedAmount: number;
  refundMethod: string;
  refundReason: string;
  refundStatus: string;
  approvalRequired: boolean;
  approvedByUserId: number | null;
  approvedDateUtc: string | null;
  processedOn: string | null;
  approvals: RefundApprovalHistoryResponse[];
  statusHistory: RefundStatusHistoryResponse[];
}
