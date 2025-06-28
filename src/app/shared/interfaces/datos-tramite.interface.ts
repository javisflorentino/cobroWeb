export interface DatosTramite {
  tramite?:              number;
  placa?:                string;
  placaAnterior?:        string;
  numeroSerie?:          string;
  tipoVehiculo?:        number;
  obtenerContribuyente?: boolean;
  fechaFactura?:        string;
  modelo?:              number;
  valorFactura?:        number;
  pagoBaja?:            number;
  pagosRealizados?:     string;
  obtenerVehiculo?:     boolean;
  claveVehicular?:      string;
  tipoMotor?:           string;
  valorVenta?:          number;


  fechaSolicitud?:     string;
  fechaAprobacion?:     string;
  fechaEnajenacion?:    string;

  tonelaje?:             string;
  capacidadPasajeros?:   string;
}
