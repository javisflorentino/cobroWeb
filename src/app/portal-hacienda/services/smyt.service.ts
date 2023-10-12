import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { Messages } from '../interface/portal-message.interface';
import { ValidateVehicle } from 'src/app/shared/interfaces/soap-valid-vehicle.interface';

@Injectable({
  providedIn: 'root'
})
export class SmytService {

  private urlMessage = 'http://localhost:3001/messages';
  private urlSOPA='tramitesSMyT/services/SMyT/validarVehiculo';

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


}
