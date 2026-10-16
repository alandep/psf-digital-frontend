/** Brazilian state (UF) reference item. */
export interface Estado {
  uf: string;
  ibgeCode: string;
  name: string;
}

/** Brazilian municipality (city) reference item. */
export interface Cidade {
  ibgeCode: string;
  uf: string;
  name: string;
}