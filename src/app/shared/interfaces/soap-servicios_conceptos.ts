export interface SoapServiciosConceptosDetalle {
  "soap:Envelope": ConceptosDetalle;
}

export interface ConceptosDetalle {
  "@attributes": SoapEnvelopeAttributes;
  "soap:Body":   SoapBody;
}

export interface SoapEnvelopeAttributes {
  "xmlns:soap": string;
}

export interface SoapBody {
  "ns2:obtenUnConceptoDetalleResponse": Ns2ObtenUnConceptoDetalleResponse;
}

export interface Ns2ObtenUnConceptoDetalleResponse {
  "@attributes": Ns2ObtenUnConceptoDetalleResponseAttributes;
  DetalleCobro:  { [key: string]: DetalleCobro };
}

export interface Ns2ObtenUnConceptoDetalleResponseAttributes {
  "xmlns:ns2": string;
}

export interface DetalleCobro {
  "#text": string;
}
