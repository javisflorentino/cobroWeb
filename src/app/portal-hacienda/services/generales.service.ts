import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environments } from 'src/environments/environments';
import { Observable, catchError, filter, map, of, tap } from 'rxjs';
import { ComboConcept, ComboDTO, DefinArrEstMun } from '../interface/datos-combo.interface';
import { CalculoConcepto } from '../interface/portal-calculo-concepto.interface';

@Injectable({
  providedIn: 'root'
})
export class GeneralesService {

  private baseUrlApp = `${environments.baseUrlApp}serviciosHacienda`;
  private urlSOAP = `${environments.baseUrlServ}`;

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

  getConceptoDetalleRest(idConcepto:number, cantidad:number): Observable<CalculoConcepto|null>{
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<CalculoConcepto>(`${this.baseUrlApp}/concepto/obtenerConcepto`,JSON.stringify({"idConcepto": idConcepto,"monto": 1,"cantidad": cantidad}),{headers})
    .pipe(
      catchError(error => of(null))
    );

  }

  async getFechaVencimientoISAN(periodo:number,ejercicio:number): Promise<any> {
    return await fetch(`${this.urlSOAP}conceptos/services/isan`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imp="http://impuestos/"><soapenv:Header/><soapenv:Body><imp:obtenFechaVencimiento><!--Optional:--><periodo>${periodo}</periodo><!--Optional:--><ejercicio>${ejercicio}</ejercicio></imp:obtenFechaVencimiento></soapenv:Body></soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8" }
    })

  }
  async getDetalleCobroISAN(importe:number, fecha:string, idConcepto:number): Promise<any> {
    console.log(importe + ' | ' + fecha + ' | ' + idConcepto)
    return await fetch(`${this.urlSOAP}conceptos/services/isan`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imp="http://impuestos/"><soapenv:Header/><soapenv:Body><imp:obtenerRezagosActualizacionAdicionales><!--Optional:--><idConcepto>${idConcepto}</idConcepto><!--Optional:--><importe>${importe}</importe><!--Optional:--><fecha>${fecha}</fecha></imp:obtenerRezagosActualizacionAdicionales></soapenv:Body></soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8" }
    });
  }
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
      headers: { "Content-type": "text/xml; charset=utf-8" }
    });
  }
}
