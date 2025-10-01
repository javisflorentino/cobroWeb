import { Injectable } from '@angular/core';
import { LoginResponse, LoginSiigemRequest } from '../interfaces/login-siigem-request';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environments } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AuthSiigemService {
  private loginURL = `https://pagos.hacienda.morelos.gob.mx/siigemWeb/auth/login`;//'serviciosHacienda/poliza/generar';

  constructor(private http: HttpClient) { }
  // Login fijo, sin intervención de usuario
  private readonly fixedCredentials: LoginSiigemRequest = {
    login: 'WS_SH1',
    password: 'Hdes22G*_106'
  };
  login(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginURL, this.fixedCredentials)
      .pipe(
        tap(response => {
          if (response.success && response.data.token) {
            localStorage.setItem('authTokenSiigem', response.data.token);
          } else {
            console.warn('Login fallido o token no recibido');
          }
        })
      );
  }
   getToken(): string | null {
    return localStorage.getItem('authTokenSiigem');
  }

  logout(): void {
    localStorage.removeItem('authTokenSiigem');
  }
}
