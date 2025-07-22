export interface DatosPago {
  referencia:   string;
  referencia2:  string;
  pkPago :      number;
  clave:        string;
  pkMunicipio:  number;
  importeTotal:      number;  
  sistema:        number;
  banco:          string;
  token?:          string;

  clienteInfo?:    BanorteCliente

}

export interface BanorteCliente {
  nombre: string;
  apellido: string;
  calle: string;
  numeroExterior: string;
  colonia: string;
  delegacion: string;
  ciudad: string;
  estado: string;
  pais: string;
  telefono: string;
  codigoPostal: string;
  correoElectronico: string;
  direccionIp: string;
}