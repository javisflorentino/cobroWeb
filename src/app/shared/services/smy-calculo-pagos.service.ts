import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { TopLevel } from '../interfaces/calculo-conceptos';
import { DatosTramite } from '../interfaces/datos-tramite.interface';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SmyCalculoPagosService {

  private urlSmytParticular = 'https://app.hacienda.morelos.gob.mx/serviciosHacienda/smyt/particular';

  constructor(private http: HttpClient, private activetedRouter: ActivatedRoute ) { }

  getCalculoPagos(datosTramite:DatosTramite): Observable<TopLevel[]> {

    let headers_object = new HttpHeaders();

    headers_object.append('Access-Control-Allow-Origin', '*');
    headers_object.append("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
   headers_object.append('Access-Control-Allow-Methods',"POST");
    headers_object.append('Content-Type', 'application/json');
    //this.headers_object.append('Accept','application/json');
    headers_object.append("Authorization", "Basic " + btoa("WS_SH1:Hdes22G*_106"));



    const httpOptions = {
      headers: headers_object
    };


    const updateData = { tramite: 1, placa: 'PXN4997', numeroSerie: '07992', obtenerContribuyente:true };

    const requestOptions = {
      method: 'POST',
      headers: headers_object,
      body: JSON.stringify(updateData),
      redirect: 'follow'
    };

    console.log("smyt_calculo-pago-service");
    return this.http.post<TopLevel[]>(`${this.urlSmytParticular}`,requestOptions)
      .pipe(
        tap(arrTramite => console.log(arrTramite)),
        catchError(error => of([]))
      );
  }
}
