import { Component, EventEmitter, Output, OnDestroy, Input, OnInit, inject } from '@angular/core';
import { PortalMenu } from '../../interface/portal-menu.interface';

import ListaDependencias from '../../../../../data/arreglos/portal_pago_menu.json'
import { MenuService } from 'src/app/shared/services/menu.service';
import { MenuConceptos } from 'src/app/shared/interfaces/shared-conceptos.interface';
import { LayoutPortalPagosComponent } from '../../pages/layout-portal-pagos.component';


@Component({
  selector: 'portalhacienda-cards-dependencias',
  templateUrl: './cards-dependencias.component.html',
  styles: [
  ]
})
export class CardsDependenciasComponent implements OnInit, OnDestroy {

  @Input()
  public viewResolution!: string;

  /* NOTA: VARIABLE USADA PAR EMITIR VALORES AL PADRE (DATOS DE LA DEP. SELECCIONADA) */
  @Output()
  public valCardDep = new EventEmitter<MenuConceptos[]>();//PortalMenu[]>();

  //public cardsArr: PortalMenu[] = ListaDependencias;

  private generalService = inject(MenuService);

  /*NOTA: LISTA DE CONCEPTOS DE LA DEPENDENCIA SELECCIONADA */
  public cardsArr: MenuConceptos[] = [];

  /* NOTA: CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading:boolean = false;

  private parentLayout = inject(LayoutPortalPagosComponent);

  constructor() {}

  ngOnInit(): void {
    this.parentLayout.redirectHome(true);
    this.generalService.requestConceptos(0)
    .subscribe(conceptos => {
      const result = conceptos.filter(resp => resp.rol == 0);
      if (result.length > 0) {
        this.cardsArr = result;
        return;
      }

      this.cardsArr = [];
      this.isLoading = false;
      return;

    });
  }

  ngOnDestroy(): void {
    console.log('DESTROY DEPENDENCIAS-CARDS');
  }
  /* NOTA: EMITE EL VALOR DE LA DEPENDECIA SELECCIONADA A LAYOUT */
  emitValCard(id: number): void {
    //this.valCardDep.emit(this.cardsArr.filter(({pk}) => pk===id))
    this.parentLayout.reciveValCard(this.cardsArr.filter(({pk}) => pk===id));
  }
}
