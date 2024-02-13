import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { Messages } from '../interface/portal-message.interface';
import { PolizaRecive } from '../interface/portal-datos-poliza.interface';
import { DatosPoliza } from '../../shared/interfaces/datos-poliza';
import { CalculoConcepto } from '../interface/portal-calculo-concepto.interface';
import { TopLevel } from 'src/app/shared/interfaces/calculo-conceptos';
import { DatosTramite } from 'src/app/shared/interfaces/datos-tramite.interface';

import { environments} from 'src/environments/environments';
/* MODIF: 12/12/2023 */
import ListMessage from '../../../../data/arreglos/alertas.json'

@Injectable({
  providedIn: 'root'
})
export class SmytService {

  private urlMessage = 'http://localhost:3001/messages';
  private urlSOPA = `${environments.baseUrlServ}`;//'tramitesSMyT/services/SMyT/validarVehiculo';
  private urlSmytGenerarPoliza = `${environments.baseUrlApp}serviciosHacienda/poliza/generar`;//'serviciosHacienda/poliza/generar';
  private urlSmytParticular = `${environments.baseUrlApp}serviciosHacienda/smyt/particular`;//'serviciosHacienda/smyt/particular';

  constructor( private http: HttpClient ) { }

  getMessages(): Observable<Messages[]> {
    return of(ListMessage.messages);
    /* MODIF: 12/12/2023 */
    //this.http.get<Messages[]>(this.urlMessage);
  }
  getMessages_vehicle(): Observable<Messages[]> {
    return of(ListMessage.messages_vehicle);
    /* MODIF: 12/12/2023 */
    //this.http.get<Messages[]>(`${this.urlMessage}_vehicle`);
  }
  getMessages_licencia(): Observable<Messages[]> {
    return of(ListMessage.messages_licencia);
    /* MODIF: 12/12/2023 */
    //this.http.get<Messages[]>(`${this.urlMessage}_licencia`);
  }
  getMesages_hacienda_reintegros(): Observable<Messages[]> {
    return of(ListMessage.messages_hacienda_reintegros);
    /* MODIF: 12/12/2023 */
    //this.http.get<Messages[]>(`${this.urlMessage}_hacienda_reintegros`);
  }

  /*async validateVehicle(placa:string,serie:string): Promise<any> {
    return await fetch(`${this.urlSOPA}`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:smyt="http://SMyT/"><soapenv:Header/><soapenv:Body><smyt:validarVehiculo><!--Optional:--><placa>${placa}</placa><!--Optional:--><noSerie>${serie}</noSerie></smyt:validarVehiculo></soapenv:Body></soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8" }
    })

  }*/
  validateVehicle(datosTramite:DatosTramite): Observable<TopLevel | null> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<TopLevel>(`${this.urlSmytParticular}`,JSON.stringify(datosTramite),{headers})
      .pipe(
        catchError(error => of())
      );
  }
  async validateVehicleSoap(placa:string,serie:string): Promise<any> {
    return await fetch(`${this.urlSOPA}tramitesSMyT/services/SMyT?wsdl`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:smyt="http://SMyT/">
      <soapenv:Header/>
      <soapenv:Body>
         <smyt:obtenEstatusVehiculo>
            <!--Optional:-->
            <placa>${placa}</placa>
            <!--Optional:-->
            <noSerie>${serie}</noSerie>
            <!--Optional:-->
            <usuario>?</usuario>
         </smyt:obtenEstatusVehiculo>
      </soapenv:Body>
   </soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8", "Content-Security-Policy": "upgrade-insecure-requests" }
    })
  }

  calcularCostoConcepto(idConcepto:number, cantida:number): Observable<CalculoConcepto[]>{
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<CalculoConcepto[]>(`serviciosHacienda/concepto/obtenerConcepto`,JSON.stringify(''),{headers});

  }

  generarPolizaServ(datosTramite:DatosPoliza): Observable<PolizaRecive> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<PolizaRecive>(`${this.urlSmytGenerarPoliza}`,JSON.stringify(datosTramite),{headers})
      .pipe(
        tap(res => console.log(res))
      );
  }


}
