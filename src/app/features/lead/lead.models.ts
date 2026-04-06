export interface LeadResponse {
  leadId: number;
  leadNumber: string;
  customerName: string;
  mobileNumber: string;
  leadStatus: string;
  convertedBookingId: number | null;
  convertedServiceRequestId: number | null;
}
