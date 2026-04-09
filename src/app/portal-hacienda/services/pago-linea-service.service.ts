import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PagoLineaServiceService {

  private http = inject(HttpClient);
  private urlPagoLinea = `${environments.URL_PASARELA_CAPTCHA}evopayment/`;//'serviciosHaciendaQA/smyt/particular';


  constructor() { }

  getSessionEvo(datosTramite: any): Observable<any> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")

    return this.http.post<any>(`${this.urlPagoLinea}generatesessionevo`, JSON.stringify(datosTramite), { headers });
  }
  genAuthPayerEvo(datosTramite: any): Observable<any> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")

    return this.http.post<any>(`${this.urlPagoLinea}authenticatepayerevo`, JSON.stringify(datosTramite), { headers });
  }

  updatesessionEvo(datosTramite: any): Observable<any> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")

    return this.http.post<any>(`${this.urlPagoLinea}updatesessionevo`, JSON.stringify(datosTramite), { headers });
  }

  authenticate3dEvo(datosTramite: any): Observable<any> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")

    return this.http.post<any>(`${this.urlPagoLinea}authenticatethreeevo`, JSON.stringify(datosTramite), { headers });
  }
}
