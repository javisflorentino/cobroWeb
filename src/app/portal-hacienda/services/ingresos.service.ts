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
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tim="http://tempuri.org/">
       <soapenv:Header/>
       <soapenv:Body>
          <tim:TimbraCFD>
             <tim:lineaCaptura>${lineaCaptura}</tim:lineaCaptura>
             <tim:usoCfdi>${uso}</tim:usoCfdi>
             <tim:formaPago>${pago}</tim:formaPago>
             <tim:metodoPago>PUE</tim:metodoPago>
             <tim:nombreReceptor>${nombre}</tim:nombreReceptor>
             <tim:codigoPostalReceptor>${cp}</tim:codigoPostalReceptor>
             <tim:regimenFiscalReceptor>${regimen}</tim:regimenFiscalReceptor>
             <tim:serieFolioCfdiRelacionado></tim:serieFolioCfdiRelacionado>
             <tim:serieFolioCfdiComplemento></tim:serieFolioCfdiComplemento>
             <tim:fechaPagoComplemento></tim:fechaPagoComplemento>
          </tim:TimbraCFD>
       </soapenv:Body>
    </soapenv:Envelope>`;
  
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

