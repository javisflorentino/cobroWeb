import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable, catchError, of, tap, switchMap } from 'rxjs';
import { Conceptos } from '../interfaces/shared-conceptos.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  public conceptoStorage: Conceptos[] = [];

  constructor( private http: HttpClient ) {
    this.loadFromLocalStorage();
   }


  private urlConceptos: string = 'http://localhost:3000/';
  //private urlSubConceptos: string = 'http://localhost:3002/menu';

  saveToLocalStorage(): void {
    localStorage.setItem( 'cachestore', JSON.stringify(this.conceptoStorage));
  }
  deleteLocalStorage(): void {
    this.conceptoStorage = [];
  }

  loadFromLocalStorage(): void {
    if ( !localStorage.getItem('cachestore') ) return ;
    this.conceptoStorage = JSON.parse(localStorage.getItem('cachestore')!);
  }

  requestConceptos(id: number): Observable<Conceptos[]> {
    this.deleteLocalStorage();
    return this.http.get<Conceptos[]>(`${this.urlConceptos}menu?padreId=${id}`)
      .pipe(
        tap(res => console.log(res)),
        catchError(error => of([])),
        tap( conceptos => this.conceptoStorage = conceptos),
        tap( () => this.saveToLocalStorage())
      );
  }
  getParentByPadreId(id: number): Observable<Conceptos[]> {
    return this.http.get<Conceptos[]>(`${this.urlConceptos}menu?id=${id}`)
      .pipe(
        tap(res => console.log(res)),
        catchError(error => of([])),
        tap( conceptos => this.conceptoStorage = conceptos),
        tap( () => this.saveToLocalStorage())
      );
  }
  getParentByIdConcept(idCponcept:number): Observable<Conceptos[]>{
    return this.http.get<Conceptos[]>(`${this.urlConceptos}menu?idConcepto=${idCponcept}`)
      .pipe(
        catchError(error => of([])),
      );
  }
  /*requestSubConceptos(id:number): Observable<Conceptos[]> {
    return this.http.get<Conceptos[]>(`${this.urlConceptos}${id}`)
      .pipe(
        catchError(error => of([])),
        tap( conceptos => {
          if ( conceptos.length > 0 ) {
            this.conceptoStorage = conceptos
          }
        })
      );
  }*/
}
