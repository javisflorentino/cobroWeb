import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IngresosService {

  constructor() { }
  async consultarCFDSoap(lineacaptura: string): Promise<any> {
    const lineaCapturaSerieFolio = `${lineacaptura}`;
    
    const soapEnvelope = `
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/">
       <soap:Header/>
       <soap:Body>
          <tem:ConsultarCFD>
             <tem:LineaCaptura>${lineaCapturaSerieFolio}</tem:LineaCaptura>
          </tem:ConsultarCFD>
       </soap:Body>
    </soap:Envelope>`;
  
    try {
      const response = await fetch("https://www.ingresos.morelos.gob.mx/ws_recibo/recibo.asmx", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "http://tempuri.org/ConsultarCFD"
        },
        body: soapEnvelope
      });
  
      if (!response.ok) {
        throw new Error(`Error SOAP: ${response.status}`);
      }
  
      const text = await response.text();
      return text; // Si quieres, aquí podrías parsear XML a JSON usando DOMParser o xml2js
    } catch (error) {
      console.error("SOAP Error:", error);
      throw error;
    }
  }
  async timbraCP(lineaCaptura: string, pago: string, uso: string, cp: string, regimen: string, nombre: string): Promise<any> {
    const soapEnvelope = `
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
       <soap:Header/>
       <soap:Body>
          <tem:TimbraCFD>
             <tem:lineaCaptura>${lineaCaptura}</tem:lineaCaptura>
             <tem:usoCfdi>${uso}</tem:usoCfdi>
             <tem:formaPago>${pago}</tem:formaPago>
             <tem:metodoPago>PUE</tem:metodoPago>
             <tem:nombreReceptor>${nombre}</tem:nombreReceptor>
             <tem:codigoPostalReceptor>${cp}</tem:codigoPostalReceptor>
             <tem:regimenFiscalReceptor>${regimen}</tem:regimenFiscalReceptor>
             <tem:serieFolioCfdiRelacionado></tem:serieFolioCfdiRelacionado>
             <tem:serieFolioCfdiComplemento></tem:serieFolioCfdiComplemento>
             <tem:fechaPagoComplemento></tem:fechaPagoComplemento>
          </tem:TimbraCFD>
       </soap:Body>
    </soap:Envelope>`;
  
    try {
      const response = await fetch("https://www.ingresos.morelos.gob.mx/wsTimbrado/Timbrado.asmx", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "http://tempuri.org/TimbraCFD"
        },
        body: soapEnvelope
      });
  
      if (!response.ok) {
        throw new Error(`Error SOAP: ${response.status}`);
      }
  
      const responseText = await response.text();
      return responseText; // Puedes parsear el XML para extraer TimbraCFDResult si lo deseas
    } catch (error) {
      console.error("SOAP Error:", error);
      throw error;
    }
  }
    
}

