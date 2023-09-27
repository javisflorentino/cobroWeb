import { Component, EventEmitter, Output } from '@angular/core';
import { PortalMenu } from '../../interface/portal-menu.interface';

import ListaDependencias from '../../../../../data/portal_pago_menu.json'

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
    console.log('Cards: ' + id);
    this.father.reciveValCard(id);
  }
}
