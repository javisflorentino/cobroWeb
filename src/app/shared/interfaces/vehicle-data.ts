export interface VehicleData {
    placa:                string;
    numeroSerie:          string;
    tramite:              number;
    tipoVehiculo?:        number;
    fechaFactura?:        Date;
    obtenerContribuyente: boolean;
    placaAnterior?:       string;
}
