import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, tap } from 'rxjs';
import { Messages } from '../interface/portal-message.interface';
import { ValidateVehicle } from 'src/app/shared/interfaces/soap-valid-vehicle.interface';
import { PolizaRecive } from '../interface/portal-datos-poliza.interface';
import { DatosPoliza } from '../../shared/interfaces/datos-poliza';
import { CalculoConcepto } from '../interface/portal-calculo-concepto.interface';

@Injectable({
  providedIn: 'root'
})
export class SmytService {

  private urlMessage = 'http://localhost:3001/messages';
  private urlSOPA='tramitesSMyT/services/SMyT/validarVehiculo';
  private urlSmytParticular = 'serviciosHacienda/poliza/generar';

  constructor( private http: HttpClient ) { }

  getMessages(): Observable<Messages[]> {
    return this.http.get<Messages[]>(this.urlMessage);
  }
  getMessages_vehicle(): Observable<Messages[]> {
    return this.http.get<Messages[]>(`${this.urlMessage}_vehicle`);
  }

  async validateVehicle(placa:string,serie:string): Promise<any> {
    return await fetch(`${this.urlSOPA}`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:smyt="http://SMyT/"><soapenv:Header/><soapenv:Body><smyt:validarVehiculo><!--Optional:--><placa>${placa}</placa><!--Optional:--><noSerie>${serie}</noSerie></smyt:validarVehiculo></soapenv:Body></soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8" }
    })

  }

  calcularCostoConcepto(idConcepto:number, cantida:number): Observable<CalculoConcepto[]>{
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa("WS_SH1:Hdes22G*_106"));

    return this.http.post<CalculoConcepto[]>(`serviciosHacienda/concepto/obtenerConcepto`,JSON.stringify(''),{headers});

  }

  generarPolizaServ(datosTramite:DatosPoliza): Observable<PolizaRecive> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa("WS_SH1:Hdes22G*_106"));

    return this.http.post<PolizaRecive>(`${this.urlSmytParticular}`,JSON.stringify(datosTramite),{headers})
      .pipe(
        tap(res => console.log(res))
      );
  }


}
