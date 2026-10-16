// Produto reutilizável do catálogo, espelha o ProdutoView do backend.
export interface Produto {
  id: string;
  name: string | null;
  ncm: string | null;
  description: string | null;
  unit: string | null;
  standardPrice: number | null;
  currency: string | null;
  originCountry: string | null;
}

// Payload de criação de um novo produto.
export interface NovoProduto {
  name: string;
  ncm?: string;
  description?: string;
  unit?: string;
  standardPrice?: number;
  currency?: string;
  originCountry?: string;
}
