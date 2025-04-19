import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-notarios',
  templateUrl: './notarios.component.html',
  styleUrls: ['./notarios.component.css']
})
export class NotariosComponent implements OnDestroy {

  private destroyed = new Subject<void>();
  /* CONTROLAR LA RESOLUCION DE LA PANTALLA */
  public sizeDisplay!: string;
  /* CONTROLAR EL TIPO DE RESOLUCIONES */
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);
  /* INYECCION DE LA DEPENDECIA QUE ESCUCHA  LA RESOLUCION ACTUAL */
  private breakpointObserver = inject(BreakpointObserver);

  public url: string =  'https://app.hacienda.morelos.gob.mx/MCISRyC/?e=5';

  constructor(){
    this.mediaQuery();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.unsubscribe();
  }

  public mediaQuery() {

    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.sizeDisplay = this.displayNameMap.get(query) ?? 'Unknown';
          }
        }
      });


  }

}
