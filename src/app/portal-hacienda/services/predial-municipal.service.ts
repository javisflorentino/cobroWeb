import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthSiigemService } from 'src/app/shared/services/auth-siigem.service';
import { environments } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PredialMunicipalService {
  private urlBusquedaEstadoCuenta = `${environments.baseUrlApp}siigemWeb/predial/consulta`;//'serviciosHacienda/poliza/generar';

  constructor(private http: HttpClient, private authSiigemService: AuthSiigemService) {}
  consultarEstadoCuenta(request: EstadoCuentaRequest): Observable<EstadoCuentaResponse> {
      const token = this.authSiigemService.getToken(); // idealmente lo sacas de localStorage o un servicio

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`

    });

    return this.http.post<EstadoCuentaResponse>(
      `${this.urlBusquedaEstadoCuenta}`, 
      request, 
      { headers }
    );
  }

}
export interface EstadoCuentaRequest {
  pkMunicipio: number;
  clave: string;
  validador: string;
  tipoPersona: number;
  correo: string;
  telefono?: string;
}

export interface EstadoCuentaResponse {
  data: EstadoCuenta;
  success: boolean;

}
export interface EstadoCuenta {
  pk: number | null;
    pkMunicipio: number;
    pkPago: number;
    pkCuenta : number;
    clave: string;
    referencia: string;
    referencia2: string;
    autorizacion: string;
    tipoPersona: number;
    validador: string;
    telefono?: string;
    importeServicio: number;
    importePredial: number;
    importeTotal: number;
    conceptos: any;
    mensaje : string;
    correo : string;
    archivo: string; // Base64 del PDF
    cobrable: boolean
}