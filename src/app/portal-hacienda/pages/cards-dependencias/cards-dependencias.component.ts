import { Component, EventEmitter, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { PortalMenu } from '../../interface/portal-menu.interface';

import ListaDependencias from '../../../../../data/arreglos/portal_pago_menu.json'

import { LayoutPortalPagosComponent } from '../layout-portal-pagos.component'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cards-dependencias',
  templateUrl: './cards-dependencias.component.html',
  styles: [
  ]
})
export class CardsDependenciasComponent implements AfterViewInit, OnDestroy {

  public cardsArr: PortalMenu[] = ListaDependencias;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  destroyed = new Subject<void>();
  public sizeDisplay!: string;
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  constructor( private father: LayoutPortalPagosComponent, private breakpointObserver: BreakpointObserver, ){
    this.isLoading = true;
    this.mediaQuery();
  }
  ngAfterViewInit(): void {
    this.isLoading = false;
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
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


  reciveValCard(id: number): void {
    let nameDep: string = '';
    //console.log(this.cardsArr.filter((c => c.padreId == id)))
    this.cardsArr.forEach(card => {
      if (card.padreId === id) {
        nameDep = card.name;
        return;
      }
    })
    this.father.reciveValCard(id,nameDep);
  }
}
