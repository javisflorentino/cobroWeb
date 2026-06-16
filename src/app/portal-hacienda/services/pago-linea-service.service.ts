import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environments } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PagoLineaServiceService {

  private http = inject(HttpClient);
  private urlPagoLinea = `${environments.URL_PASARELA_CAPTCHA}evopayment/`;//'serviciosHaciendaQA/smyt/particular';

  private baseUrlAppAuthToken = `${environments.PATH_SYSTEM_TOKEN}`;
  private urlBanbajio = `${environments.URL_BANBAJIO}${environments.CONTEX_PATH_BANBAJIO}/`;

  private userForLogin = environments.USER_FOR_LOGIN;
  private passForLogin = environments.PASS_FOR_LOGIN;
  private sistemForLogin = environments.SISTEM_FOR_LOGIN;

    private urlSantander = `${environments.URL_SANTANDER}${environments.CONTEX_PATH_SANTANDER}/`;



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

  /* BANBAJIO, SANTANDER */
  getTokenAuth(): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.USER_BY_SISTEM_TOKEN}:${environments.PASS_BY_SISTEM_TOKEN}`));

    const datosTramite = {
      "usuario": this.userForLogin,
      "contraseña": this.passForLogin,
      "sistema": this.sistemForLogin
    };

    return this.http.post<any>(`${this.baseUrlAppAuthToken}/login`, JSON.stringify(datosTramite), { headers })
      .pipe(
        map(resp => {
          if (resp.success) {
            return resp;
          }
          throw { message: resp.mensaje, error: "Unauthorized", statusCode: 401 };
        }),
        catchError((error: HttpErrorResponse) => {
          // Verificamos si el error es un 504 Gateway Timeout
          if (error.status === 504) {
            console.error('El servidor tardó demasiado en responder (504).');
            // Puedes retornar un mensaje amigable que el componente pueda leer
            return throwError(() => new Error('El servidor de destino no responde (Timeout). Por favor, intenta más tarde.'));
          }

          // Manejo de otros errores genéricos
          return throwError(() => new Error('Ocurrió un error inesperado en la comunicación.'));
        })
      );
  }

  /* BANBAJIO */
  getSessionBanbajio(datosTramite: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.urlBanbajio}api/v1/pagos/iniciar`, JSON.stringify(datosTramite), { headers });
  }

  verificarStatus(transaccionId: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.urlBanbajio}api/v1/pagos/status/${transaccionId}`, { headers });
  }

  /* SANTANDER */
  getSessionSantander(datosTramite: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.urlSantander}api/v1/pagos/iniciar`, JSON.stringify(datosTramite), { headers });
  }

  verificarStatusSantander(transaccionId: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.urlSantander}api/v1/pagos/centroPagos`, JSON.stringify({lineaCaptura:transaccionId}), { headers });
  }
}
