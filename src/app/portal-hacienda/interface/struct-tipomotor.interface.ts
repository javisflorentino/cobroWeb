export interface StructTipoMotor {
  success: boolean;
  data:    TipoMotor[];
}

export interface TipoMotor {
  id: string;
  descripcion: string;
}
