export interface CMSBlockResponse {
  cmsBlockId: number;
  blockKey: string;
  title: string;
  summary: string;
  content: string;
  previewImageUrl: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
  versionNumber: number;
  dateCreated: string;
  lastUpdated: string | null;
}

export interface CMSBannerResponse {
  cmsBannerId: number;
  bannerTitle: string;
  bannerSubtitle: string;
  imageUrl: string;
  redirectUrl: string;
  displayArea: string;
  activeFromDate: string | null;
  activeToDate: string | null;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
}

export interface CMSFaqResponse {
  cmsFaqId: number;
  category: string;
  question: string;
  answer: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
}

export interface DisplayContentSettingResponse {
  displayContentSettingId: number;
  contentGroup: string;
  contentKey: string;
  contentValue: string;
  contentType: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
}

export interface PublicHomeCMSContentResponse {
  blocks: CMSBlockResponse[];
  banners: CMSBannerResponse[];
  faqs: CMSFaqResponse[];
  displaySettings: DisplayContentSettingResponse[];
}

export interface CommunicationPreferenceResponse {
  communicationPreferenceId: number;
  customerId: number;
  emailAddress: string;
  mobileNumber: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsAppEnabled: boolean;
  pushEnabled: boolean;
  allowPromotionalContent: boolean;
  lastUpdated: string | null;
}
