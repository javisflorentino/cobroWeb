export interface VehicleData {
    placa:                string;
    numeroSerie:          string;
    tramite:              number;
    tipoVehiculo?:        number;
    fechaFactura?:        Date;
    obtenerContribuyente: boolean;
    placaAnterior?:       string;

    capacidadPasajeros?:  number;
    centimetrosCubicos?:  number;
    modelo?:              number;
    noCilindros?:         number;
    procedencia?:         string;
    valorFactura?:        number;

    pagoBaja?:            number;
}
