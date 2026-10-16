// País de referência global, espelha o PaisView do backend (GET /bff/paises).
export interface Pais {
  alpha2: string;
  alpha3: string;
  namePt: string;
  nameEn: string;
}
