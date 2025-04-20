import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environments } from 'src/environments/environments';
import { Observable, catchError, filter, map, of, tap } from 'rxjs';
import { ComboConcept, ComboDTO, DefinArrEstMun } from '../interface/datos-combo.interface';
import { CalculoConcepto } from '../interface/portal-calculo-concepto.interface';
import { AbstractControl, ValidationErrors } from '@angular/forms';

import { ValidateVehicle } from 'src/app/shared/interfaces/soap-valid-vehicle.interface';
import { ConvertXmlString } from 'src/app/shared/clases/convert-xml-string';

@Injectable({
  providedIn: 'root'
})
export class GeneralesService {

  private baseUrlApp = `${environments.baseUrlApp}serviciosHacienda`;
  private urlSOAP = `${environments.baseUrlServ}`;

  private asJson!:ValidateVehicle;
  private xmlSring: ConvertXmlString = new ConvertXmlString();

  constructor( private http: HttpClient ) { }

  getEntidadesFederativas(idEntidad?:number): Observable<ComboDTO|null> {
    let headers = new HttpHeaders();
    const body = (idEntidad)?JSON.stringify({"pkEntidadFederativa": idEntidad}):JSON.stringify({});
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<ComboDTO>(`${this.baseUrlApp}/combo/obtenerEstados`,body,{headers})
      .pipe(
        catchError(error => of(null))
      );
  }
  getMunicipios(idEntidad:number, idMunicipio?: number): Observable<ComboDTO|null> {
    let headers = new HttpHeaders();
    let body: DefinArrEstMun = {} as DefinArrEstMun;//JSON.stringify({"pkEntidadFederativa": idEntidad});//new FormData();
    body.pkEntidadFederativa = idEntidad;
    if ( idMunicipio ) {
      body.pkMunicipio = idMunicipio;
    }
    //body.append("pkEntidadFederativa", idEntidad);
    headers = headers.set("Content-Type", "application/json")
    .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));
    //headers = headers.set("mimeType", "multipart/form-data")


    return this.http.post<ComboDTO>(`${this.baseUrlApp}/combo/obtenerListaMunicipios`,body,{headers})
      .pipe(
        catchError(error => of(null))
      );
  }

  getLocalida(idMunicipio: string): Observable<ComboDTO|null> {
    let headers = new HttpHeaders();
    const body= new FormData();
    body.append("pk", idMunicipio);
    headers = headers.set("mimeType", "multipart/form-data")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));
    return this.http.post<ComboDTO>(`${this.baseUrlApp}/combo/obtenerLocalidades`,body,{headers})
    .pipe(
      tap(resp => console.log(resp)),
      catchError(error => of(null))
    );
  }

  getConceptoDetalleRest(idConcepto:number, cantidad:number, monto:number): Observable<CalculoConcepto|null>{
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<CalculoConcepto>(`${this.baseUrlApp}/concepto/obtenerConcepto`,JSON.stringify({"idConcepto": idConcepto,"monto": monto,"cantidad": cantidad}),{headers})
    .pipe(
      catchError(error => of(null))
    );

  }

  getConceptoDetallebyForm(idConcepto:number, cantidad:number, idFomr:string, formaType:string): Observable<CalculoConcepto|null>{
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<CalculoConcepto>(`${this.baseUrlApp}/concepto/validarFormulario`,JSON.stringify([{"id": idFomr,"idConcepto": idConcepto,"data": [{"id": formaType,"value": cantidad}]}]),{headers})
    .pipe(
      tap(resp=>console.log(resp)),
      catchError(error => of(null))
    );

  }

  async getFechaVencimientoISAN(periodo:number,ejercicio:number): Promise<any> {
    return await fetch(`${this.urlSOAP}conceptos/services/isan`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imp="http://impuestos/"><soapenv:Header/><soapenv:Body><imp:obtenFechaVencimiento><!--Optional:--><periodo>${periodo}</periodo><!--Optional:--><ejercicio>${ejercicio}</ejercicio></imp:obtenFechaVencimiento></soapenv:Body></soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8"},
      redirect: "follow"
    })

  }

  getDetalleCobroISAN(importe:number, fecha:string, periodo: number, idConcepto:number): Observable<CalculoConcepto|null> {
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));
    console.log([{"id": "sh-form-16","idConcepto": idConcepto,"data": [{"id": "sh-input-monto","value": importe},{"id": "sh-input-periodo","value": periodo},{"id": "sh-input-ejercicioFiscal","value": fecha}]}])
    return this.http.post<CalculoConcepto>(`${this.baseUrlApp}/concepto/validarFormulario`,JSON.stringify([{"id": "sh-form-16","idConcepto": idConcepto,"data": [{"id": "sh-input-monto","value": importe},{"id": "sh-input-periodo","value": periodo},{"id": "sh-input-ejercicioFiscal","value": fecha}]}]),{headers})
    .pipe(
      map(resp => {
        if(resp.success) {
          return resp;
        }
        throw {message:resp.mensaje,error:"Unauthorized",statusCode:401};
      }),
      catchError(error => { throw error; })
    );
  }
  async getRezagosActualizaciones(idConcepto:number, monto:number, fecha:string): Promise<any> {
    return await fetch(`${this.urlSOAP}conceptos/services/isan`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imp="http://impuestos/">
        <soapenv:Header/>
        <soapenv:Body>
          <imp:obtenerRezagosActualizacionAdicionales>
            <!--Optional:-->
            <idConcepto>${idConcepto}</idConcepto>
            <!--Optional:-->
            <importe>${monto}</importe>
            <!--Optional:-->
            <fecha>${fecha}</fecha>
          </imp:obtenerRezagosActualizacionAdicionales>
        </soapenv:Body>
      </soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8"},
      redirect: "follow"
    });
  }
  
  /*async getDetalleCobroISAN(importe:number, fecha:string, idConcepto:number): Promise<any> {
    console.log(importe + ' | ' + fecha + ' | ' + idConcepto)
    return await fetch(`${this.urlSOAP}conceptos/services/isan`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imp="http://impuestos/"><soapenv:Header/><soapenv:Body><imp:obtenerRezagosActualizacionAdicionales><!--Optional:--><idConcepto>${idConcepto}</idConcepto><!--Optional:--><importe>${importe}</importe><!--Optional:--><fecha>${fecha}</fecha></imp:obtenerRezagosActualizacionAdicionales></soapenv:Body></soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8"},
      redirect: "follow"
    });
  }*/
  async getConceptoDetalle(idConcepto:number, monto:number): Promise<any> {
    return await fetch(`${this.urlSOAP}conceptos/services/conceptos`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:con="http://conceptos/">
      <soapenv:Header/>
      <soapenv:Body>
         <con:obtenUnConceptoDetalle>
            <!--Optional:-->
            <idConcepto>${idConcepto}</idConcepto>
            <!--Optional:-->
            <monto>${monto}</monto>
            <!--Optional:-->
            <cantidad>1</cantidad>
         </con:obtenUnConceptoDetalle>
      </soapenv:Body>
   </soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8"},
      redirect: "follow"
    });
  }

  async validateVahicleOnDb(placa:string, no_serie:string): Promise<any> {
    return await fetch(`${this.urlSOAP}tramitesSMyT/services/SMyT`,{
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:smyt="http://SMyT/">
      <soapenv:Header/>
      <soapenv:Body>
         <smyt:validarVehiculo>
            <!--Optional:-->
            <placa>${placa}</placa>
            <!--Optional:-->
            <noSerie>${no_serie}</noSerie>
         </smyt:validarVehiculo>
      </soapenv:Body>
   </soapenv:Envelope>`,
      headers:{"Content-type": "text/xml; charset=utf-8"},
      redirect: "follow"
    });
  }

  public validateVahicle( serie: string, placa: string, mssg: number, tramite: number, tipoVehiculo: string, fechaFactura:string ) {
    return ( formGroup: AbstractControl ): ValidationErrors | null => {
      const fielValue1 = formGroup.get(serie)?.value;
      const fileValue2 = formGroup.get(placa)?.value;

      if(!formGroup.get(serie)?.pristine) {
        this.validateVahicleOnDb(fileValue2,fielValue1)
        .then(response => response.text())
        .then(xml => {
          this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
          const response = this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'];
          if(response.includes('EXITO')) {
            formGroup.get(serie)?.setErrors( null );
            return null;
          }
          formGroup.get(serie)?.setErrors( { notEqual: true, error:1 } );
            return { notEqual: true };
        });
      }

      formGroup.get(serie)?.markAsTouched();
      formGroup.get(serie)?.setErrors( null );
      return null;
    }
  }
  envioCDFI(title:string, serie: string, folio: string, para: string){
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    const body = {"lineaCaptura":title, "serie": serie, "folio": folio, "destinatario": para}

    return this.http.post<{success: boolean}>(`${this.baseUrlApp}/recibo/cfdi/correoCfdi`, body, {headers})
    .pipe(
      map(response => response.success), 
      catchError(error => {
        console.error('Error al enviar CFDI:', error);
        return of(false); // Devolvemos false en lugar de null para mantener el mismo tipo de retorno
      })
    );
  }
}
