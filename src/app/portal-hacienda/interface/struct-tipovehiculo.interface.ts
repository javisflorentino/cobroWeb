export interface StructTipoVehiculo {
  success: boolean;
  data:    TipoVehiculo[];
}

export interface TipoVehiculo {
  pkdmgCTipovehiculo: number;
  descripcion:   string;
  status:        number;
}
