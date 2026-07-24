import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild, inject, OnDestroy } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MenuService } from '../../services/menu.service';
import { MenuConceptos } from '../../interfaces/shared-conceptos.interface';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

/* OBTIENE LA LISTA DE CONCEPTOS QUE PERMITEN AGREGAR MAS CONCEPTOS */
import ListaMasConceptos from '../../../../../data/arreglos/agregar_mas_conceptos.json';
import { MoreConcept } from '../../interfaces/shared-conceptos_mas_conceptos';

export interface IdPadre {
  padreId: number;
}

@Component({
  selector: 'shared-sidenav-conceptos',
  templateUrl: './sidenav-conceptos.component.html',
  styleUrls: ['./sidenav-conceptos.component.css']
})
export class SidenavConceptosComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @Input() public reciveActionSideNav: Subject<boolean> = new Subject<boolean>();
  @Input() public valDependenciaCard: Subject<MenuConceptos[]> = new Subject<MenuConceptos[]>();
  @Input() public eraseLocalStor: Subject<boolean> = new Subject<boolean>();

  @Output() public fathAlert = new EventEmitter<string>();
  @Output() private nameConcept = new EventEmitter<string>();

  public showBack: boolean = false;
  public showMessage: boolean = false;
  public showMessage_errReq: boolean = false;
  public itemsConceptos: MenuConceptos[] = [];
  public isLoading: boolean = false;

  private listaConceptos: MoreConcept = ListaMasConceptos;

  @ViewChild('sidenav') public changSidenav!: MatSidenav;

  private generalService = inject(MenuService);
  private router = inject(Router);

  ngOnInit(): void {
    this.reciveActionSideNav.subscribe(() => {
      this.changSidenav.toggle();
    });

    this.eraseLocalStor.subscribe(() => {
      sessionStorage.removeItem('contribuyente_only');
      sessionStorage.removeItem('vehicle_data');
      sessionStorage.removeItem('vehicle_data_adicional');
      sessionStorage.removeItem('datos_poliza');
      sessionStorage.removeItem('datos_cobro');
      sessionStorage.removeItem('idParent');
      sessionStorage.removeItem('gestora');
      sessionStorage.removeItem('route_origen');
      sessionStorage.removeItem('concept');
      sessionStorage.removeItem('contribuyente');
      sessionStorage.removeItem('repetir_concepto');
      sessionStorage.removeItem('cachestore');
      sessionStorage.removeItem('movimiento');

      this.itemsConceptos = [];
      this.showMessage = true;
      this.showMessage_errReq = false;
      this.showBack = false;
      this.router.navigate(['/pagos/dependencias']);
    });
  }

  ngAfterViewInit(): void {
    this.valDependenciaCard.subscribe(resp => {
      sessionStorage.removeItem('idParent');
      this.activeIdParent(resp[0].pk, "0", resp[0].pk);
    });
  }

  ngOnDestroy(): void {
    console.log('Destroy SideNav');
    this.reciveActionSideNav.unsubscribe();
    this.eraseLocalStor.unsubscribe();
    this.valDependenciaCard.unsubscribe();
  }

  processChangeOnView(id: number): void {
    this.buildMenu(id);
  }

  buildMenu(padreId: number) {
    this.isLoading = true;
    if (!sessionStorage.getItem('idParent') || JSON.parse(sessionStorage.getItem('idParent')!).length <= 1) {
      this.showBack = false;
    }
    this.generalService.requestConceptos(padreId).subscribe(conceptos => {
      if (conceptos !== undefined) {
        const result = conceptos.filter(resp => resp.rol == 0);
        if (result.length > 0) {
          this.generalService.conceptoStorage = result;
          this.showMessage = false;
          this.showMessage_errReq = false;
          this.itemsConceptos = result;
          this.isLoading = false;
          if (this.changSidenav.opened == false) {
            this.changSidenav.toggle();
          }
          return;
        }

        this.itemsConceptos = [];
        this.showMessage = true;
        this.isLoading = false;
        return;
      }
      this.showMessage_errReq = true;
      this.isLoading = false;
      this.itemsConceptos = [];
    });
  }

  backMenu() {
    if (sessionStorage.getItem('idParent')) {
      sessionStorage.removeItem('contribuyente');
      let idParent: IdPadre[] = JSON.parse(sessionStorage.getItem('idParent')!);
      const idControl = idParent[idParent.length - 2].padreId;
      idParent.pop();
      if (idParent.length === 0) {
        sessionStorage.removeItem('idParent');
        this.showBack = false;
      }
      sessionStorage.setItem('idParent', JSON.stringify(idParent));
      this.buildMenu(idControl);
      this.router.navigate(['/pagos/dependencias', true]);
      return;
    }
  }

  dellLocalStore() {
    if (sessionStorage.getItem('contribuyente_only')) sessionStorage.removeItem('contribuyente_only');
    if (sessionStorage.getItem('vehicle_data')) sessionStorage.removeItem('vehicle_data');
    if (sessionStorage.getItem('vehicle_data_adicional')) sessionStorage.removeItem('vehicle_data_adicional');
    if (sessionStorage.getItem('datos_poliza')) sessionStorage.removeItem('datos_poliza');
    if (sessionStorage.getItem('datos_cobro')) sessionStorage.removeItem('datos_cobro');
  }

  generalLocalStorRepetirConcept(idConcepto: string | number) {
    let flat: boolean = false;
    Object.keys(this.listaConceptos).forEach((k) => {
      this.listaConceptos[k as keyof MoreConcept].filter(resp => {
        if (resp.concepto == idConcepto) {
          sessionStorage.setItem('repetir_concepto', JSON.stringify(this.listaConceptos[k as keyof MoreConcept]));
          flat = true;
        }
      });
    });
    if (flat) return;

    sessionStorage.removeItem('contribuyente');
    sessionStorage.removeItem('repetir_concepto');
  }

  buildTitle(concept: string) {
    sessionStorage.setItem('concept', concept);
    this.nameConcept.emit(concept);
  }

  activeIdParent(padreId: number, idConcepto: string, id: number) {
    let x: IdPadre[] = JSON.parse(sessionStorage.getItem('idParent')!);
    if (x) {
      x.push({ 'padreId': padreId });
      sessionStorage.setItem('idParent', JSON.stringify(x));
    } else {
      sessionStorage.setItem('idParent', JSON.stringify([{ padreId: padreId }]));
    }

    this.buildMenu((Number(idConcepto) > 0) ? Number(idConcepto) : id);
    if (JSON.parse(sessionStorage.getItem('idParent')!).length > 1) {
      this.showBack = true;
    }
    return;
  }

  actionList(item: string, concept: string, id: number, idConcepto: string | number, padreId: number, gestora?: number, tipoMovimiento?: number) {
    sessionStorage.setItem('movimiento', String(tipoMovimiento));
    
    let opcValue: string | null = null;
    let itemCleaned: string = item || '';
    
    if (itemCleaned && itemCleaned.includes('?opc=')) {
      const urlParts = itemCleaned.split('?opc=');
      itemCleaned = urlParts[0];
      opcValue = urlParts[1];
    }
    
    if (Number(gestora) > 0) {
      if (this.generalService.conceptoStorage.filter(resp => resp.idConcepto === Number(idConcepto) && resp.combinable == 1).length == 0) {
        (sessionStorage.getItem('contribuyente')) ? sessionStorage.removeItem('contribuyente') : '';
      }
    }

    if (new RegExp('^(?:https?):\/\/?').test(itemCleaned)) {
      window.open(`${itemCleaned}`);
      return;
    }

    this.dellLocalStore();

    sessionStorage.setItem('gestora', String(gestora));
    sessionStorage.setItem('route_origen', itemCleaned);

    idConcepto = idConcepto.toString();
    if (idConcepto === "0" && gestora === 0) {
      this.activeIdParent(padreId, idConcepto, id);
      return;
    }
    this.isLoading = false;
    this.itemsConceptos = this.generalService.conceptoStorage;
    this.buildTitle(concept);

    const conceptSelect: MenuConceptos[] = this.itemsConceptos.filter(resp => resp.pk == id);

    if (idConcepto !== "0" || gestora! > 0) {
      this.changSidenav.toggle();
    }

    if (conceptSelect[0].formulario > 1) {
      if (conceptSelect[0].formulario === 8) {
        idConcepto = 4023;
      }
    }

    const navigationPath = ['/pagos/' + itemCleaned, idConcepto, conceptSelect[0].formulario];
    const navigationOptions: any = {};
    
    if (opcValue) {
      navigationOptions.queryParams = { opc: opcValue };
    }
    
    this.router.navigate(navigationPath, navigationOptions);
    return;
  }
}