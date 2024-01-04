import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, pipe, tap, filter, find } from 'rxjs';
import { Conceptos, MenuConceptos } from '../interfaces/shared-conceptos.interface';

import ListaConceptos from '../../../../data/arreglos/smyt_conceptos_arr.json'
import { environments } from 'src/environments/environments';


@Injectable({
  providedIn: 'root'
})
export class MenuService {

  public conceptoStorage: MenuConceptos[] = [];//Conceptos[] = [];

  constructor( private http: HttpClient ) {
    this.loadFromLocalStorage();
   }


  private urlConceptos: string = `${environments.baseUrlApp}`//'http://localhost:3000/';
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

  /* DESCOMENTAR ESTE METODO SI SE VA A CONSUMIR POR SERVICIO Y COMENTAR SU COPIA */
  requestConceptos(id: number): Observable<MenuConceptos[]> {
    this.deleteLocalStorage();
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<Conceptos>(`${this.urlConceptos}serviciosHacienda/concepto/menuConceptos`,
      JSON.stringify(id),{headers})
    .pipe(
      map(resp => resp.data),
      tap(resp => this.conceptoStorage = resp),
      catchError(error => of([])),
    );



  }
  /*requestConceptos(id: number): Conceptos[] {
    this.deleteLocalStorage();
    let listaC = ListaConceptos;
    listaC.forEach(f=> {
      f.menu.forEach(ff => {
        if (ff.padreId === id ) {
          this.conceptoStorage.push(ff);//console.log(ff)
        }
      })
    })
    this.saveToLocalStorage();
    return this.conceptoStorage;
  }*/
  /*getParentByPadreId(id: number): Observable<Conceptos[]> {
    return this.http.get<Conceptos[]>(`${this.urlConceptos}menu?id=${id}`)
      .pipe(
        tap(res => console.log(res)),
        catchError(error => of([])),
        tap( conceptos => this.conceptoStorage = conceptos),
        tap( () => this.saveToLocalStorage())
      );
  }*/
  /*getParentByIdConcept(idCponcept:number): Observable<Conceptos[]>{
    return this.http.get<Conceptos[]>(`${this.urlConceptos}menu?idConcepto=${idCponcept}`)
      .pipe(
        catchError(error => of([])),
      );
  }*/
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
