import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TopLevel } from '../interfaces/calculo-conceptos';
import { DatosTramite } from '../interfaces/datos-tramite.interface';
import { ActivatedRoute } from '@angular/router';

import { environments } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SmyCalculoPagosService {

  private urlSmytParticular = `${environments.baseUrlApp}serviciosHacienda/smyt/particular`;//'serviciosHacienda/smyt/particular';
  private pagoLinea = `${environments.baseUrlApp}pagoenlinea`;//'pagoenlinea';
  private otherPages = `${environments.baseUrlApp}serviciosHacienda/concepto/obtenerConcepto`

  constructor(private http: HttpClient, private activetedRouter: ActivatedRoute ) { }

  getCalculoPagos(datosTramite:DatosTramite): Observable<TopLevel> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<TopLevel>(`${this.urlSmytParticular}`,JSON.stringify(datosTramite),{headers});
  }
  otherCalculoPagos(datosTramite:object): Observable<TopLevel> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<TopLevel>(`${this.otherPages}`,JSON.stringify(datosTramite),{headers});
  }
  sendDataPortalLinea() {
    //https://app.hacienda.morelos.gob.mx/pagoenlinea/
    let headers = new HttpHeaders();
    const params = 'numeroPoliza=12420495value1&fecha=2023-11-11&lineaCaptura=93001242049540408284&monto=820&nombrePago=PRUEBA PRUEBA PRUEBA&lineaDetallePago=prueba&pago215=2015&banco=Bancomer&extra=ECONOMIA-';
    const body=JSON.stringify(params);

    headers = headers.set("Content-Type", "application/x-www-form-urlencoded");

    return this.http.post(`${this.pagoLinea}/`,params,{headers})
    .subscribe(resp => {
      window.open(`${this.pagoLinea}/?data=${encodeURI(params)}`, '_blank')
    })
  }
}
