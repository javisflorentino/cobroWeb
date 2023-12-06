export interface estadoVehiculo {
  "soap:Envelope": SoapEnvelope;
}

export interface SoapEnvelope {
  "@attributes": SoapEnvelopeAttributes;
  "soap:Body":   SoapBody;
}

export interface SoapEnvelopeAttributes {
  "xmlns:soap": string;
}

export interface SoapBody {
  "ns2:obtenEstatusVehiculoResponse": Ns2ObtenEstatusVehiculoResponse;
}

export interface Ns2ObtenEstatusVehiculoResponse {
  "@attributes":   Ns2ObtenEstatusVehiculoResponseAttributes;
  estatusVehiculo: EstatusVehiculo;
}

export interface Ns2ObtenEstatusVehiculoResponseAttributes {
  "xmlns:ns2": string;
}

export interface EstatusVehiculo {
  registroHistorico: RegistroHistorico[];
  propietario:       Propietario;
  domicilio:         Domicilio;
  vehiculo:          Vehiculo;
}

export interface Domicilio {
  idDomicilio:                CodigoPostal;
  tipoVialidad:               Camino;
  nombreVialidad:             CodigoPostal;
  carretera:                  Camino;
  camino:                     Camino;
  numeroExterior:             CodigoPostal;
  numeroExteriorAlfanumerico: Camino;
  numeroExteriorAnterior:     Camino;
  numeroInterior:             Camino;
  numeroInteriorAlfanumerico: Camino;
  tipoAsentamiento:           Camino;
  nombreAsentamiento:         CodigoPostal;
  codigoPostal:               CodigoPostal;
  localidad:                  Camino;
  municipio:                  CodigoPostal;
  estado:                     CodigoPostal;
  tipoReferencia1:            Camino;
  tipoReferencia2:            Camino;
  tipoReferencia3:            Camino;
  referencia1:                Camino;
  referencia2:                Camino;
  referencia3:                Camino;
  descripcionUbicacion:       Camino;
  tipoDomicilio:              Camino;
  situacionDomicilio:         Camino;
  numeroSucursal:             Camino;
  telefono:                   CodigoPostal;
  latitud:                    Camino;
  longitud:                   Camino;
}

export interface Camino {
}

export interface CodigoPostal {
  "#text"?: string;
}

export interface Propietario {
  idContribuyente: CodigoPostal;
  rfc:             CodigoPostal;
  curp:            Camino;
  nombre:          CodigoPostal;
  apellidoPaterno: CodigoPostal;
  apellidoMaterno: CodigoPostal;
  razonSocial:     CodigoPostal;
  abreviatura:     Camino;
  tipoPersona:     CodigoPostal;
  fechaNacimiento: CodigoPostal;
  contrasena:      CodigoPostal;
  genero:          CodigoPostal;
  nacionalidad:    CodigoPostal;
  domicilio:       Domicilio;
}

export interface RegistroHistorico {
  idHistorico:     CodigoPostal;
  noSerie:         CodigoPostal;
  placa:           CodigoPostal;
  placaAnterior:   CodigoPostal;
  claveConcepto:   CodigoPostal;
  concepto:        CodigoPostal;
  ejercicioFiscal: CodigoPostal;
  importe:         CodigoPostal;
  recargos:        CodigoPostal;
  adicional15:     CodigoPostal;
  adicional5i:     CodigoPostal;
  adicional5u:     CodigoPostal;
  gastos:          CodigoPostal;
  multas:          CodigoPostal;
  descuentos:      CodigoPostal;
  fechaPago:       CodigoPostal;
  recibo:          CodigoPostal;
  lineaCaptura:    Camino;
}

export interface Vehiculo {
  idVehiculo:         CodigoPostal;
  noSerie:            CodigoPostal;
  placa:              CodigoPostal;
  placaAnterior:      Camino;
  noCilindros:        CodigoPostal;
  centimetrosCubicos: Camino;
  modelo:             CodigoPostal;
  valorFactura:       CodigoPostal;
  valorVenta:         CodigoPostal;
  tonelaje:           Camino;
  combustible:        Combustible;
  procedencia:        Procedencia;
  servicio:           Combustible;
  domVehiculo:        DOMVehiculo;
}

export interface Combustible {
  id:          CodigoPostal;
  clave:       CodigoPostal;
  descripcion: CodigoPostal;
}

export interface DOMVehiculo {
  id:                CodigoPostal;
  calle:             CodigoPostal;
  codigoPostal:      CodigoPostal;
  colonia:           CodigoPostal;
  entidadFederativa: CodigoPostal;
  localidad:         CodigoPostal;
  municipio:         CodigoPostal;
  noExterior:        CodigoPostal;
  noInterior:        CodigoPostal;
  noSerie:           CodigoPostal;
}

export interface Procedencia {
  id:          CodigoPostal;
  descripcion: CodigoPostal;
  procedencia: CodigoPostal;
}
