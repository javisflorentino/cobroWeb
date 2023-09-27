import { Component } from '@angular/core';
import { PortalMenu } from '../../interface/portal-menu.interface';

import ListaDependencias from '../../../../../data/portal_pago_menu.json'

@Component({
  selector: 'app-cards-dependencias',
  templateUrl: './cards-dependencias.component.html',
  styles: [
  ]
})
export class CardsDependenciasComponent {
  public cardsArr: PortalMenu[] = ListaDependencias;
}
