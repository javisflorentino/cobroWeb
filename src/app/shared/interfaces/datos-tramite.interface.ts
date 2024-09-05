export interface DatosTramite {
  tramite:              number;
  placa:                string;
  numeroSerie:          string;
  tipoVehiculo?:        number;
  obtenerContribuyente: boolean;
  fechaFactura?:        string;
  modelo?:              number;
  valorFactura?:        number;
  pagoBaja?:            number;
  pagosRealizados?:      string;
}
