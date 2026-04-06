export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};

export type LookupItemResponse = {
  value: number;
  label: string;
};

export type SupportTicketListItemResponse = {
  supportTicketId: number;
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerMobile: string;
  linkedEntityType: string | null;
  linkedEntitySummary: string;
  categoryName: string;
  priorityName: string;
  status: string;
  assignedUserId: number | null;
  assignedOwnerName: string | null;
  dateCreated: string;
  lastUpdated: string | null;
};

export type SupportTicketLinkResponse = {
  supportTicketLinkId: number;
  linkedEntityType: string;
  linkedEntityId: number;
  linkReference: string;
  linkSummary: string;
};

export type SupportTicketReplyResponse = {
  supportTicketReplyId: number;
  replyText: string;
  isInternalOnly: boolean;
  isFromCustomer: boolean;
  createdBy: string;
  replyDateUtc: string;
};

export type SupportTicketStatusHistoryResponse = {
  supportTicketStatusHistoryId: number;
  status: string;
  remarks: string;
  createdBy: string;
  statusDateUtc: string;
};

export type SupportTicketDetailResponse = {
  supportTicketId: number;
  ticketNumber: string;
  subject: string;
  description: string;
  customerId: number;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  supportTicketCategoryId: number;
  categoryName: string;
  supportTicketPriorityId: number;
  priorityName: string;
  status: string;
  assignedUserId: number | null;
  assignedOwnerName: string | null;
  dateCreated: string;
  lastUpdated: string | null;
  canCustomerClose: boolean;
  canManage: boolean;
  links: SupportTicketLinkResponse[];
  replies: SupportTicketReplyResponse[];
  statusHistory: SupportTicketStatusHistoryResponse[];
};

export type CreateSupportTicketPayload = {
  customerId: number | null;
  subject: string;
  categoryId: number;
  priorityId: number;
  description: string;
  links: { linkedEntityType: string; linkedEntityId: number }[];
};
