// Importador (cliente/comprador) reutilizável, espelha o ClienteView do backend.
export interface Importador {
  id: string;
  name: string;
  country?: string | null;
  document?: string | null;
  address?: string | null;
  contact?: string | null;
}

// Payload de criação de um novo importador.
export interface NovoImportador {
  name: string;
  country?: string;
  document?: string;
  address?: string;
  contact?: string;
}
