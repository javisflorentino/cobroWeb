import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  //'https://app.hacienda.morelos.gob.mx/serviciosHacienda/smyt/particular';

  constructor(private http: HttpClient, private activetedRouter: ActivatedRoute ) { }

  getCalculoPagos(datosTramite:DatosTramite): Observable<TopLevel> {

    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa("WS_SH1:Hdes22G*_106"));

    /*const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(updateData),
      redirect: 'follow'
    };*/

    return this.http.post<TopLevel>(`${this.urlSmytParticular}`,JSON.stringify(datosTramite),{headers});
  }
}
