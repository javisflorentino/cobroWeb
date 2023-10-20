import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { PortalMenu } from '../../interface/portal-menu.interface';

import ListaDependencias from '../../../../../data/arreglos/portal_pago_menu.json'

import { LayoutPortalPagosComponent } from '../layout-portal-pagos.component'

@Component({
  selector: 'app-cards-dependencias',
  templateUrl: './cards-dependencias.component.html',
  styles: [
  ]
})
export class CardsDependenciasComponent implements AfterViewInit {

  public cardsArr: PortalMenu[] = ListaDependencias;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  constructor( private father: LayoutPortalPagosComponent ){
    this.isLoading = true;
  }
  ngAfterViewInit(): void {
    this.isLoading = false;
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
