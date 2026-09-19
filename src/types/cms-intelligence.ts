// Types for CMS Intelligence (MOCK). Backend-agnostic shapes.
export type CmsReviewStatus = 'DRAFT' | 'REVIEW_REQUIRED' | 'APPROVED' | 'REJECTED';
export type CmsPublicationStatus = 'SCHEDULED' | 'PUBLISHED' | 'EXPIRED' | 'ARCHIVED' | 'NONE';

export interface CmsIntelligenceItem {
  id: string;
  title: string;
  type: string;
  source: string;
  summary: string;
  impactLevel: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sectors: string;
  countries: string;
  aiAnalysis: string;
  aiGenerated: boolean;
  reviewStatus: CmsReviewStatus;
  publicationStatus: CmsPublicationStatus;
  updatedAt: Date;
}

export interface CmsIntelligenceStats {
  collected: number;
  grouped: number;
  analyzed: number;
  published: number;
  pendingReview: number;
}
