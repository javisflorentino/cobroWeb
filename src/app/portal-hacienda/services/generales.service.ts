import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environments } from 'src/environments/environments';
import { Observable, catchError, filter, map, of, tap } from 'rxjs';
import { ComboDTO } from '../interface/datos-combo.interface';

@Injectable({
  providedIn: 'root'
})
export class GeneralesService {

  private baseUrlApp = `${environments.baseUrlApp}serviciosHacienda`;

  constructor( private http: HttpClient ) { }

  getEntidadesFederativas(): Observable<ComboDTO|null> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<ComboDTO>(`${this.baseUrlApp}/combo/obtenerEntidadesFederativas`,{headers})
      .pipe(
        catchError(error => of(null))
      );
  }
  getMunicipios(idEntidad:string): Observable<ComboDTO|null> {
    let headers = new HttpHeaders();
    const body= new FormData();
    body.append("pk", idEntidad);
    headers = headers.set("mimeType", "multipart/form-data")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<ComboDTO>(`${this.baseUrlApp}/combo/obtenerMunicipios`,body,{headers})
      .pipe(
        tap(resp => console.log(resp)),
        catchError(error => of(null))
      );
  }
}
