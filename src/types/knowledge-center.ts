export type KnowledgeCategory = 'DOCUMENTATION' | 'FAQ' | 'VIDEO_TUTORIAL' | 'BEST_PRACTICES';
export type KnowledgeDifficulty = 'BASICO' | 'INTERMEDIARIO' | 'AVANCADO';
export type KnowledgeModule = 'EXPORTACOES' | 'FINANCEIRO' | 'LOGISTICA' | 'COMPLIANCE' | 'PRODUTOS' | 'INTEGRAÇÕES';

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: KnowledgeCategory;
  module: KnowledgeModule;
  difficulty: KnowledgeDifficulty;
  tags: string[];
  author: string;
  viewCount: number;
  rating: number;
  ratingCount: number;
  videoUrl: string;
  videoDuration: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

export interface KnowledgeCenterMetrics {
  totalArtigos: number;
  faqs: number;
  tutoriaisVideo: number;
  ratingMedio: number;
}

export interface KnowledgeCenterFilters {
  searchText: string;
  modules: KnowledgeModule[];
  category: KnowledgeCategory | '';
  difficulty: KnowledgeDifficulty | '';
}
