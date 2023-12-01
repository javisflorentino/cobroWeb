export interface IsanCobros {
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
  "ns2:obtenerRezagosActualizacionAdicionalesResponse": Ns2ObtenerRezagosActualizacionAdicionalesResponse;
}

export interface Ns2ObtenerRezagosActualizacionAdicionalesResponse {
  "@attributes": Ns2ObtenerRezagosActualizacionAdicionalesResponseAttributes;
  adeudos:       { [key: string]: Adeudo };
}

export interface Ns2ObtenerRezagosActualizacionAdicionalesResponseAttributes {
  "xmlns:ns2": string;
}

export interface Adeudo {
  "#text": string;
}
