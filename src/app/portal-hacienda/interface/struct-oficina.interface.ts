export interface StructOffice {
  success: boolean;
  data:    office[];
}

export interface office {
  pkdmgCOficina: number;
  descripcion:   string;
  status:        number;
}
