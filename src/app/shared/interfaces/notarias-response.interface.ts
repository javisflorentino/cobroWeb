export interface DatosNotariaResponse {
  data: ConceptosNotaria[];
  success: boolean;
  mensaje: string;
}

export interface ConceptosNotaria {
  pk: number;
  notario: string;
  rfc: string;
  numero: number;
  localidad: string;
  domicilio: string;
  telefonoOficina: string;
  activo: boolean;
}
