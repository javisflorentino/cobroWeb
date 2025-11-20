import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { Messages } from '../interface/portal-message.interface';
import { PolizaRecive } from '../interface/portal-datos-poliza.interface';
import { DatosPoliza } from '../../shared/interfaces/datos-poliza';
import { CalculoConcepto } from '../interface/portal-calculo-concepto.interface';
import { TopLevel } from 'src/app/shared/interfaces/calculo-conceptos';
import { DatosTramite } from 'src/app/shared/interfaces/datos-tramite.interface';

import { environments } from 'src/environments/environments';
/* MODIF: 12/12/2023 */
import ListMessage from '../../../../data/arreglos/alertas.json';
import OficinasTramite from '../../../../data/arreglos/oficinas_tramite.json';
//import TipoVehiculo from '../../../../data/arreglos/tipo_vehiculo.json';
import TipoVehiculo from '../../../../data/arreglos/smyt_tipo_vehiculo.json';

import TipoMotor from '../../../../data/arreglos/tipo_motor.json';

import { StructOffice } from '../interface/struct-oficina.interface';
import { StructTipoVehiculo } from '../interface/struct-tipovehiculo.interface';
import { StructTipoMotor } from '../interface/struct-tipomotor.interface';

@Injectable({
  providedIn: 'root'
})
export class SmytService {

  private urlMessage = 'http://localhost:3001/messages';
  private urlSOPA = `${environments.baseUrlServ}`;//'tramitesSMyT/services/SMyT/validarVehiculo';
  private urlSmytGenerarPoliza = `${environments.baseUrlApp}serviciosHacienda/poliza/generar`;//'serviciosHacienda/poliza/generar';
  private urlSmytParticular = `${environments.baseUrlApp}serviciosHacienda/smyt/particular`;//'serviciosHacienda/smyt/particular';
  private urlSmytParticularPublico = `${environments.baseUrlApp}serviciosHacienda/smyt/publico`;//'serviciosHacienda/smyt/particular';
  private urlValidarCehiculo = `${environments.baseUrlApp}serviciosHacienda/smyt/validarVehiculo`;//'serviciosHacienda/smyt/particular';
  /*TODO: Carlos A 17/07/2025 */
  private urlSmytValidVehiculo = `${environments.baseUrlApp}serviciosHacienda/smyt/validarVehiculo`;//'serviciosHacienda/smyt/particular';


  constructor(private http: HttpClient) { }

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

  /* TODO: 24/06/2025 Carlos A.  Se agregaron los siguientes 3 metodos que generar y retornan un observable, simulando una peticion HTTP*/
  getOficinas(): Observable<StructOffice> {
    return of({ success: true, data: OficinasTramite });
  }

  getTipoVahiculo(): Observable<StructTipoVehiculo> {
    return of({ success: true, data: TipoVehiculo });
  }
  getTipoMotor(): Observable<StructTipoMotor> {
    return of({ success: true, data: TipoMotor });
  }

  /*async validateVehicle(placa:string,serie:string): Promise<any> {
    return await fetch(`${this.urlSOPA}`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:smyt="http://SMyT/"><soapenv:Header/><soapenv:Body><smyt:validarVehiculo><!--Optional:--><placa>${placa}</placa><!--Optional:--><noSerie>${serie}</noSerie></smyt:validarVehiculo></soapenv:Body></soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8" }
    })

  }*/
  validateVehiclePublico(datosTramite: DatosTramite): Observable<TopLevel | null> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<TopLevel>(`${this.urlSmytParticularPublico}`, JSON.stringify(datosTramite), { headers })
      .pipe(
        catchError(err => {
          let message = '';
          return throwError(() => {
            message = `Error ${err.status}, ${err.statusText}. Repórtelo al CAT e intentelo mas tarde`;
            return { message: message, code: `${err.status}` };
          });
        })
      );
  }

  validateVehicle(datosTramite: DatosTramite): Observable<TopLevel | null> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<TopLevel>(`${this.urlSmytParticular}`, JSON.stringify(datosTramite), { headers })
      .pipe(
        catchError(err => {
          let message = '';
          return throwError(() => {
            message = `Error ${err.status}, ${err.statusText}. Repórtelo al CAT e intentelo mas tarde`;
            return { message: message, code: `${err.status}` };
          });
        })
      );
  }
  ExisteVehiculo(datosTramite: DatosTramite): Observable<{ data: boolean, success: boolean }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${environments.user_server}:${environments.pass_server}`)
    });

    return this.http.post<{ data: boolean, success: boolean }>(
      `${this.urlValidarCehiculo}`,
      datosTramite,
      { headers }
    ).pipe(
      catchError(err => {
        const message = `Error ${err.status}, ${err.statusText}. Repórtelo al CAT e inténtelo más tarde`;
        return throwError(() => ({
          message,
          code: `${err.status}`
        }));
      })
    );
  }

  /*TODO: Carlos A 17/07/2025 */
  validarVehiculo(datosTramite: DatosTramite): Observable<TopLevel | null> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<TopLevel>(`${this.urlSmytValidVehiculo}`, JSON.stringify(datosTramite), { headers })
      .pipe(
        catchError(err => {
          let message = '';
          return throwError(() => {
            message = `Error ${err.status}, ${err.statusText}. Repórtelo al CAT e intentelo mas tarde`;
            return { message: message, code: `${err.status}` };
          });
        })
      );
  }


  async validateVehicleSoap(placa: string, serie: string): Promise<any> {
    try {
      const response = await fetch(`${this.urlSOPA}tramitesSMyT/services/SMyT?wsdl`, {
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
              <usuario></usuario>
          </smyt:obtenEstatusVehiculo>
        </soapenv:Body>
    </soapenv:Envelope>`,
        headers: { "Content-type": "text/xml; charset=utf-8" },
        redirect: "follow"
      });
      if (response.ok) {
        return response;
      } else {
        if (response.status === 404) throw new Error('404, No se encontró el END-POINT. Repórtelo al CAT e intentelo mas tarde');
        if (response.status === 500) throw new Error('500, Error interno del servidor. Repórtelo al CAT e intentelo mas tarde');
        if (response.status === 504) throw new Error('504, Error de conexión con el servidor. Repórtelo al CAT e intentelo mas tarde');
        // For any other server error
        throw new Error(`${response.status}, Error desconocido. Repórtelo al CAT e intentelo mas tarde`);
      }
    } catch (err) {
      throw err
    }
  }

  calcularCostoConcepto(idConcepto: number, cantida: number): Observable<CalculoConcepto[]> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<CalculoConcepto[]>(`serviciosHacienda/concepto/obtenerConcepto`, JSON.stringify(''), { headers });

  }

  generarPolizaServ(datosTramite: DatosPoliza): Observable<PolizaRecive> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<PolizaRecive>(`${this.urlSmytGenerarPoliza}`, JSON.stringify(datosTramite), { headers });
  }


}
