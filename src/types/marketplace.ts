export type MarketplaceCategory = 'ERP' | 'LOGISTICS' | 'FINANCE' | 'COMPLIANCE' | 'ANALYTICS' | 'COMMUNICATION';
export type MarketplaceStatus = 'ACTIVE' | 'AVAILABLE' | 'MAINTENANCE' | 'COMING_SOON';

export interface MarketplaceConnector {
  id: string;
  name: string;
  category: MarketplaceCategory;
  description: string;
  longDescription: string;
  icon: string;
  status: MarketplaceStatus;
  rating: number;
  reviewCount: number;
  features: string[];
  pricing: string;
  requirements: string[];
  version: string;
  developer: string;
  lastUpdated: Date;
  addedAt: Date;
  installCount: number;
  isFeatured: boolean;
  reviews: MarketplaceReview[];
}

export interface MarketplaceReview {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface MarketplaceMetrics {
  conectoresAtivos: number;
  disponiveis: number;
  categorias: number;
  adicionadosRecentemente: number;
}

export interface MarketplaceFilters {
  searchText: string;
  categories: MarketplaceCategory[];
  status: MarketplaceStatus | '';
  sortBy: 'name' | 'rating' | 'category' | 'recent';
}
