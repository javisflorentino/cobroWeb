import { Component, EventEmitter, Output, OnDestroy, Input } from '@angular/core';
import { PortalMenu } from '../../interface/portal-menu.interface';

import ListaDependencias from '../../../../../data/arreglos/portal_pago_menu.json'


@Component({
  selector: 'portalhacienda-cards-dependencias',
  templateUrl: './cards-dependencias.component.html',
  styles: [
  ]
})
export class CardsDependenciasComponent implements OnDestroy {

  @Input()
  public viewResolution!: string;

  /* NOTA: VARIABLE USADA PAR EMITIR VALORES AL PADRE (DATOS DE LA DEP. SELECCIONADA) */
  @Output()
  public valCardDep = new EventEmitter<PortalMenu[]>();

  public cardsArr: PortalMenu[] = ListaDependencias;

  constructor() {}

  ngOnDestroy(): void {
    console.log('DESTROY DEPENDENCIAS-CARDS');
  }
  /* NOTA: EMITE EL VALOR DE LA DEPENDECIA SELECCIONADA A LAYOUT */
  emitValCard(id: number): void {
    this.valCardDep.emit(this.cardsArr.filter(({padreId}) => padreId===id))
  }
}
