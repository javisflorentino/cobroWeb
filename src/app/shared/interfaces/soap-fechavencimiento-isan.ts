export interface FechaVencimientoISAN {
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
  "ns2:obtenFechaVencimientoResponse": Ns2ObtenFechaVencimientoResponse;
}

export interface Ns2ObtenFechaVencimientoResponse {
  "@attributes":    Ns2ObtenFechaVencimientoResponseAttributes;
  fechaVencimiento: FechaVencimiento;
}

export interface Ns2ObtenFechaVencimientoResponseAttributes {
  "xmlns:ns2": string;
}

export interface FechaVencimiento {
  "#text": Date;
}
