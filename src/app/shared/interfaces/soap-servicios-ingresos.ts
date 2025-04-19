

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
    "ConsultarCFDResponse": ConsultarCFDResponse;
  }
  
  export interface ConsultarCFDResponse {
    "@attributes":   ConsultarCFDResponseAttributes;
    ConsultarCFDResult: consultarCFDResult;

  }
  export interface consultarCFDResult{
    Serie: CodigoPostal;
    Folio:             CodigoPostal;
    Subtotal:            CodigoPostal;
    Total:          CodigoPostal;
    MeotodoPago: CodigoPostal;
    IdOficina: CodigoPostal;
    Oficina:     CodigoPostal;
    RFC:     CodigoPostal;
    NombreContribuyente:     CodigoPostal;
    Domicilio: CodigoPostal;
    conceptos: [];
  }

  export interface ConsultarCFDResponseAttributes {
    "xmlns": string;
  }
  


  
  export interface Camino {
  }
  
  export interface CodigoPostal {
    "#text"?: string;
  }
  

  export interface Recibo {
    Serie: CodigoPostal;
    Folio:             CodigoPostal;
    Subtotal:            CodigoPostal;
    Total:          CodigoPostal;
    MeotodoPago: CodigoPostal;
    IdOficina: CodigoPostal;
    Oficina:     CodigoPostal;
    RFC:     CodigoPostal;
    NombreContribuyente:     CodigoPostal;
    Domicilio: CodigoPostal;
   
  }

  
