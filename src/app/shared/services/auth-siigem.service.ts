import { Injectable } from '@angular/core';
import { LoginResponse, LoginSiigemRequest } from '../interfaces/login-siigem-request';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environments } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AuthSiigemService {

  private loginURL = `/${environments.siigemEnviroment}/auth/login`;//'serviciosHacienda/poliza/generar';
  token:string = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwcmluY2lwYWwiOiJXU19TSDEiLCJzdWIiOiJVU1VBUklPIFBBR0lOQSBIQUNJRU5EQSIsIkF1dGhvcml0eSI6WyJST0xfUFJFRElBTF9QT1JUQUwiXSwic2lzdGVtYSI6MywibXVuaWNpcGlvIjoiQ1VFUk5BVkFDQSIsImlzcyI6ImFwcC5oYWNpZW5kYS5tb3JlbG9zLmdvYi5teCIsImlkTXVuaWNpcGlvIjo3LCJ1c2VySWQiOjIzNTEsImlhdCI6MTc2OTE5MjYzNiwidXJsIjpbIi9wcmVkaWFsL3BvcnRhbCIsIi9wcmVkaWFsL2NvbnN1bHRhIiwiL3ByZWRpYWwvbm90aWZpYWNpb25QYWdvIiwiL2NhdGFsb2dvL2xpc3RhciIsIi9wcmVkaWFsL2RldGFsbGVNdW5pY2ljcGlvIiwiL2ltcHVlc3Rvcy9jZWR1bGFyIiwiL2ltcHVlc3Rvcy9jZWR1bGFyIiwiL2ltcHVlc3Rvcy9jZWR1bGFyL3JlcG9ydGUiXSwianRpIjoiZDFmN2EyMDItYTJlZi00ZDE0LWFhMGEtNGYxZGQxNWI1NjdjIn0.kOAzg28q5zAaYmFELQJfsLUBnC77UvtA3nrSEL3HJk0"
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
