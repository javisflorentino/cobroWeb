import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, filter, map, of, tap } from 'rxjs';
import { TopLevel } from '../interfaces/calculo-conceptos';
import { DatosTramite } from '../interfaces/datos-tramite.interface';
import { ActivatedRoute, Data } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SmyCalculoPagosService {

  private urlSmytParticular = 'serviciosHacienda/smyt/particular';
  private pagoLinea = 'pagoenlinea';
  //'https://app.hacienda.morelos.gob.mx/serviciosHacienda/smyt/particular';

  constructor(private http: HttpClient, private activetedRouter: ActivatedRoute ) { }

  getCalculoPagos(datosTramite:DatosTramite): Observable<TopLevel> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa("WS_SH1:Hdes22G*_106"));

    return this.http.post<TopLevel>(`${this.urlSmytParticular}`,JSON.stringify(datosTramite),{headers});
  }
  otherCalculoPagos(datosTramite:object): Observable<TopLevel> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa("WS_SH1:Hdes22G*_106"));

    return this.http.post<TopLevel>(`serviciosHacienda/concepto/obtenerConcepto`,JSON.stringify(datosTramite),{headers});
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
