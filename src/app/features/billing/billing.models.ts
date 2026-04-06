export interface QuotationLineResponse {
  quotationLineId: number;
  lineType: string;
  lineDescription: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface BillingStatusHistoryResponse {
  billingStatusHistoryId: number;
  entityType: string;
  statusName: string;
  remarks: string;
  statusDateUtc: string;
  changedBy: string;
}

export interface QuotationDetailResponse {
  quotationId: number;
  quotationNumber: string;
  jobCardId: number;
  jobCardNumber: string;
  serviceRequestId: number;
  serviceRequestNumber: string;
  bookingId: number;
  bookingReference: string;
  customerId: number;
  customerName: string;
  mobileNumber: string;
  addressSummary: string;
  serviceName: string;
  currentStatus: string;
  quotationDateUtc: string;
  subTotalAmount: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotalAmount: number;
  customerDecisionRemarks: string;
  approvedDateUtc: string | null;
  rejectedDateUtc: string | null;
  invoiceId: number | null;
  invoiceNumber: string | null;
  invoiceStatus: string | null;
  lines: QuotationLineResponse[];
  billingHistory: BillingStatusHistoryResponse[];
}

export interface PaymentReceiptResponse {
  paymentReceiptId: number;
  receiptNumber: string;
  invoiceId: number;
  paymentTransactionId: number;
  receiptDateUtc: string;
  receivedAmount: number;
  balanceAmount: number;
  receiptRemarks: string;
}

export interface PaymentTransactionResponse {
  paymentTransactionId: number;
  invoiceId: number;
  paymentMethod: string;
  referenceNumber: string;
  paidAmount: number;
  paymentDateUtc: string;
  transactionRemarks: string;
  receipt: PaymentReceiptResponse | null;
}

export interface InvoiceLineResponse {
  invoiceLineId: number;
  quotationLineId: number | null;
  lineType: string;
  lineDescription: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface InvoiceListItemResponse {
  invoiceId: number;
  invoiceNumber: string;
  quotationId: number;
  quotationNumber: string;
  customerName: string;
  currentStatus: string;
  grandTotalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  invoiceDateUtc: string;
}

export interface InvoiceDetailResponse {
  invoiceId: number;
  invoiceNumber: string;
  quotationId: number;
  quotationNumber: string;
  customerId: number;
  customerName: string;
  mobileNumber: string;
  addressSummary: string;
  serviceName: string;
  currentStatus: string;
  invoiceDateUtc: string;
  subTotalAmount: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  lastPaymentDateUtc: string | null;
  lines: InvoiceLineResponse[];
  payments: PaymentTransactionResponse[];
  billingHistory: BillingStatusHistoryResponse[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
