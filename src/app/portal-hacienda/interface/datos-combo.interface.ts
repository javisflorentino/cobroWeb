export interface ComboDTO {
  data:    ComboConcept[];
  success: boolean;
}

export interface ComboConcept {
  pk:          number;
  descripcion: string;
}

export interface DefinArrEstMun {
  pkEntidadFederativa: number;
  pkMunicipio: number;
}
