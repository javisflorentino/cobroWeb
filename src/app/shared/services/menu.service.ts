import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { Conceptos } from '../interfaces/shared-conceptos.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor( private http: HttpClient ) { }

  private urlConceptos: string = 'http://localhost:3000/menu?q=';

  requestConceptos(id: number): Observable<Conceptos[]> {
    return this.http.get<Conceptos[]>(`${this.urlConceptos}${id}`)
      .pipe(
        catchError(error => of([])),
      );
  }
}
