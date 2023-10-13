import { Component, EventEmitter, Output } from '@angular/core';
import { PortalMenu } from '../../interface/portal-menu.interface';

import ListaDependencias from '../../../../../data/arreglos/portal_pago_menu.json'

import { LayoutPortalPagosComponent } from '../layout-portal-pagos.component'

@Component({
  selector: 'app-cards-dependencias',
  templateUrl: './cards-dependencias.component.html',
  styles: [
  ]
})
export class CardsDependenciasComponent {

  public cardsArr: PortalMenu[] = ListaDependencias;

  constructor( private father: LayoutPortalPagosComponent ){}


  reciveValCard(id: number): void {
    let nameDep: string = '';
    this.cardsArr.forEach(card => {
      if (card.padreId === id) {
        nameDep = card.name;
        return;
      }
    })
    this.father.reciveValCard(id,nameDep);
  }
}
