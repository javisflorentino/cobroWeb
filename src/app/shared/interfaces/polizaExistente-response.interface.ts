export interface PolizaExistenteResponse {
  data: ConceptosPolizaExistente[];
  success: boolean;
  message: string;
}

export interface ConceptosPolizaExistente {
  fecha_elaboracion: string,
  estado: string,
  pagado: string,
  nombre_contribuyente: string,
  numero_poliza: string,
  importe: number,
  linea_captura: string
}
