export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface InstallationSummaryResponse {
  installationId: number;
  installationNumber: string;
  leadId: number | null;
  installationStatus: string;
  approvalStatus: string;
  customerName: string;
  mobileNumber: string;
  installationType: string;
  numberOfUnits: number;
  surveyDateUtc: string | null;
  scheduledInstallationDateUtc: string | null;
  proposalNumber: string | null;
  proposalTotalAmount: number | null;
  installationOrderNumber: string | null;
  warrantyRegistrationNumber: string | null;
}

export interface InstallationListItemResponse {
  installationId: number;
  installationNumber: string;
  customerName: string;
  mobileNumber: string;
  addressSummary: string;
  installationType: string;
  numberOfUnits: number;
  installationStatus: string;
  approvalStatus: string;
  surveyDateUtc: string | null;
  scheduledInstallationDateUtc: string | null;
  assignedTechnicianName: string | null;
  proposalNumber: string | null;
  proposalTotalAmount: number | null;
  installationOrderNumber: string | null;
}

export interface InstallationProposalLineResponse {
  installationProposalLineId: number;
  lineDescription: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  remarks: string;
}

export interface InstallationProposalResponse {
  installationProposalId: number;
  proposalNumber: string;
  proposalStatus: string;
  subTotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  proposalRemarks: string;
  customerRemarks: string;
  generatedDateUtc: string;
  decisionDateUtc: string | null;
  lines: InstallationProposalLineResponse[];
}

export interface InstallationChecklistItemResponse {
  installationChecklistId: number;
  checklistTitle: string;
  checklistDescription: string;
  isMandatory: boolean;
  isCompleted: boolean;
  responseRemarks: string;
  responseDateUtc: string | null;
}

export interface InstallationCommissioningResponse {
  commissioningCertificateId: number;
  certificateNumber: string;
  warrantyRegistrationNumber: string;
  commissioningDateUtc: string;
  customerConfirmationName: string;
  customerSignatureName: string;
  isAccepted: boolean;
  remarks: string;
}

export interface InstallationStatusHistoryResponse {
  installationStatusHistoryId: number;
  previousStatus: string;
  currentStatus: string;
  remarks: string;
  changedByRole: string;
  createdBy: string;
  changedDateUtc: string;
}

export interface InstallationExecutionOrderResponse {
  installationOrderId: number;
  installationOrderNumber: string;
  currentStatus: string;
  scheduledInstallationDateUtc: string | null;
  executionStartedDateUtc: string | null;
  executionCompletedDateUtc: string | null;
  technicianId: number | null;
  technicianName: string | null;
  helperCount: number;
}

export interface InstallationDetailResponse {
  installationId: number;
  installationNumber: string;
  leadId: number | null;
  leadNumber: string | null;
  customerId: number;
  customerName: string;
  mobileNumber: string;
  emailAddress: string | null;
  customerAddressId: number;
  addressLine1: string;
  addressLine2: string;
  cityName: string;
  pincode: string;
  installationType: string;
  numberOfUnits: number;
  siteNotes: string;
  installationStatus: string;
  approvalStatus: string;
  assignedTechnicianId: number | null;
  assignedTechnicianName: string | null;
  surveyDateUtc: string | null;
  proposalApprovedDateUtc: string | null;
  scheduledInstallationDateUtc: string | null;
  installationStartedDateUtc: string | null;
  installationCompletedDateUtc: string | null;
  commissionedDateUtc: string | null;
  proposals: InstallationProposalResponse[];
  checklistItems: InstallationChecklistItemResponse[];
  orders: InstallationExecutionOrderResponse[];
  commissioningCertificates: InstallationCommissioningResponse[];
  statusTimeline: InstallationStatusHistoryResponse[];
}
