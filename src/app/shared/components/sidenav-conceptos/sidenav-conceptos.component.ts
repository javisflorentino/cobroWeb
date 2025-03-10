import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MenuService } from '../../services/menu.service';
import { MenuConceptos } from '../../interfaces/shared-conceptos.interface';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

/* OBTIENE LA LISTA DE CONCEPTOS QUE PERMITEN AGREGAR MAS CONCEPTOS */
import ListaMasConceptos from '../../../../../data/arreglos/agregar_mas_conceptos.json'
import { MoreConcept } from '../../interfaces/shared-conceptos_mas_conceptos';
import { PortalMenu } from '../../interfaces/portal-menu.interface';

export interface IdPadre {
  padreId: number
}


@Component({
  selector: 'shared-sidenav-conceptos',
  templateUrl: './sidenav-conceptos.component.html',
  styleUrls: ['./sidenav-conceptos.component.css']
})
export class SidenavConceptosComponent implements OnInit, AfterViewInit {
  /* NOTA: RECIBE EL EVENTO DE CERRAR O ABRIR MENU DEL PADRE LAYOUT Y ESTE A AU VEZ LO RECIBE DEL HIJO TOOLBAR */
  @Input()
  public reciveActionSideNav: Subject<boolean> = new Subject<boolean>();

  /* NOTA: RECIBE UN OBJETO DEL PADRE LAYOUT DE LA DEPENDECIA SELECCIONADA POR EL HIJO DEPENDENCIAS-CARD */
  @Input()
  public valDependenciaCard: Subject<MenuConceptos[]> = new Subject<MenuConceptos[]>();//Subject<PortalMenu[]> = new Subject<PortalMenu[]>();

  /* NOTA: RECIBE LA ORDEN DEL PADRE PARA BORRAR LA LISTA DE CONCEPTOS */
  @Input()
  public eraseLocalStor: Subject<boolean> = new Subject<boolean>();//: boolean = false

  /* NOTA: ENVIA ALERTA AL PADRE PARA SER DIBUJADA */
  @Output()
  public fathAlert = new EventEmitter<string>();

  /* NOTA: ENVIA AL PADRE EL NOMBRE DEL CONCEPTO SELECCIONADO */
  @Output()
  private nameConcept = new EventEmitter<string>();

  /* NOTA: EN LOS MENUS ANIDADOS CONTROLA EL BOTON DE BACK */
  public showBack: boolean = false;
  public showMessage: boolean = false;
  public showMessage_errReq: boolean = false;

  /*NOTA: LISTA DE CONCEPTOS DE LA DEPENDENCIA SELECCIONADA */
  public itemsConceptos: MenuConceptos[] = [];

  /* NOTA: CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading: boolean = false;

  /* CONTROLA LA LISTA DE CONCEPTOS QUE PERMITEN AGREGAR MAS CONCEPTOS */
  private listaConceptos: MoreConcept = ListaMasConceptos;

  /* NOTA: CONTROLA LA ACCION SOBRE EL SIDENAV DE ACUERDO A LA ACCION DEL HERMANO TOOLBAR */
  @ViewChild('sidenav')
  public changSidenav!: MatSidenav;

  private generalService = inject(MenuService);
  private router = inject(Router);

  ngOnInit(): void {

    /* AL DIR CLICK EN EL ICONO MENU DEL TOOLBAR SE DISPARA ESTA ACCION */
    this.reciveActionSideNav.subscribe(() => {
      this.changSidenav.toggle();
    });



    /* NOTA: SE EJECUTA CUANDO EN EL TOOLBAR SE PRECIONA HOME  */
    this.eraseLocalStor.subscribe(() => {
      //localStorage.clear();
      localStorage.removeItem('contribuyente_only');
      localStorage.removeItem('vehicle_data');
      localStorage.removeItem('vehicle_data_adicional');
      localStorage.removeItem('datos_poliza');
      localStorage.removeItem('datos_cobro');
      localStorage.removeItem('idParent');
      localStorage.removeItem('gestora');
      localStorage.removeItem('route_origen');
      localStorage.removeItem('concept');
      localStorage.removeItem('contribuyente');
      localStorage.removeItem('datos_poliza');
      localStorage.removeItem('repetir_concepto');
      localStorage.removeItem('cachestore');
      localStorage.removeItem('movimiento');

      this.itemsConceptos = [];
      //this.changSidenav.toggle();
      this.showMessage = true;
      this.showMessage_errReq = false;
      this.showBack = false;
      this.router.navigate(['/pagos/dependencias']);//['/pagos']);
    })
  }

  ngAfterViewInit(): void {
    /*
      NOTA: OBSERVACLE EN ESPERA DE VALORES DE DEPENDENCIA SELECCIONADA,
      VALORES QUE SON ENVIADOS POR DEPENDENCIAS-CARDS
    */
    this.valDependenciaCard.subscribe(resp => {
      //this.processChangeOnView(resp[0].padreId);
      localStorage.removeItem('idParent');
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
    if (!localStorage.getItem('idParent') || JSON.parse(localStorage.getItem('idParent')!).length <= 1) {
      this.showBack = false;
    }
    this.generalService.requestConceptos(padreId)
      .subscribe(conceptos => {
        if (conceptos !== undefined) {
          const result = conceptos.filter(resp => resp.rol == 0);
          if (result.length > 0) {
            this.generalService.conceptoStorage = result;
            this.showMessage = false;
            this.showMessage_errReq = false;
            this.itemsConceptos = result
            this.isLoading = false;
            if (this.changSidenav.opened == false)
              this.changSidenav.toggle();
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
    if (localStorage.getItem('idParent')) {
      localStorage.removeItem('contribuyente');
      let idParent: IdPadre[] = JSON.parse(localStorage.getItem('idParent')!);
      const idControl = idParent[idParent.length - 2].padreId;
      idParent.pop();
      if (idParent.length === 0) {
        localStorage.removeItem('idParent');
        this.showBack = false;
      }
      localStorage.setItem('idParent', JSON.stringify(idParent))
      this.buildMenu(idControl);
      this.router.navigate(['/pagos/dependencias', true]);
      return;
    }
  }

  dellLocalStore() {
    if (localStorage.getItem('contribuyente_only'))
      localStorage.removeItem('contribuyente_only');
    if (localStorage.getItem('vehicle_data'))
      localStorage.removeItem('vehicle_data');
    if (localStorage.getItem('vehicle_data_adicional'))
      localStorage.removeItem('vehicle_data_adicional');
    if (localStorage.getItem('datos_poliza'))
      localStorage.removeItem('datos_poliza');
    if (localStorage.getItem('datos_cobro'))
      localStorage.removeItem('datos_cobro');
  }

  /*
    NOTA:  DETERMINA SI EL CONCEPTO PERMITE AGREGAR MAS CONCEPTOS DE SU SECCION
    MODIF: 12/12/2023
  */
  generalLocalStorRepetirConcept(idConcepto: string | number) {
    let flat: boolean = false;
    Object.keys(this.listaConceptos).forEach((k, v) => {
      this.listaConceptos[k as keyof MoreConcept].filter(resp => {
        if (resp.concepto == idConcepto) {
          localStorage.setItem('repetir_concepto', JSON.stringify(this.listaConceptos[k as keyof MoreConcept]));
          flat = true;
        }
      });
    });
    if (flat) return;

    localStorage.removeItem('contribuyente');
    localStorage.removeItem('repetir_concepto');
  }

  buildTitle(concept: string) {
    localStorage.setItem('concept', concept);
    this.nameConcept.emit(concept);
  }

  activeIdParent(padreId: number, idConcepto: string, id: number) {
    let x: IdPadre[] = JSON.parse(localStorage.getItem('idParent')!);
    if (x) {
      x.push({ 'padreId': padreId });//x.forEach(() => x.push({ 'padreId': padreId }))
      localStorage.setItem('idParent', JSON.stringify(x));
    } else {
      localStorage.setItem('idParent', JSON.stringify([{ padreId: padreId }]));
    }

    this.buildMenu((Number(idConcepto) > 0) ? Number(idConcepto) : id);
    if (JSON.parse(localStorage.getItem('idParent')!).length > 1)
      this.showBack = true;
    return;
  }

  actionList(item: string, concept: string, id: number, idConcepto: string | number, padreId: number, gestora?: number, tipoMovimiento?:number) {
    //console.log(item + '-' + concept + '-' + id + '-' + idConcepto + '-' + padreId + '-' + gestora)
    /*
      NOTA:  DETERMINA SI EL CONCEPTO PERMITE AGREGAR MAS CONCEPTOS DE SU SECCION
      MODIF: 12/12/2023
    */
    localStorage.setItem('movimiento',String(tipoMovimiento))
    if (Number(gestora) > 0) {
      if (this.generalService.conceptoStorage.filter(resp => resp.idConcepto === Number(idConcepto) && resp.combinable == 1).length == 0) {
        (localStorage.getItem('contribuyente')) ? localStorage.removeItem('contribuyente') : '';
      }
      /*if (!localStorage.getItem('repetir_concepto')) {
        this.generalLocalStorRepetirConcept(idConcepto);
      } else {
        const repetir_concepto = JSON.parse(localStorage.getItem('repetir_concepto')!);
        const resp = Object.keys(repetir_concepto).filter(k => repetir_concepto[k].concepto == idConcepto)
        if (resp.length == 0) {
          this.fathAlert.emit('El concepto seleccionado no perteneceal mismo grupo, <br>Se borrarán los conceptos previamente seleccionados.  ');
          this.generalLocalStorRepetirConcept(idConcepto);
        }
      }*/
    }

    if (new RegExp('^(?:https?):\/\/?').test(item)) {
      window.open(`${item}`);
      return;
    }

    this.dellLocalStore();

    localStorage.setItem('gestora', String(gestora));
    localStorage.setItem('route_origen', item);

    idConcepto = idConcepto.toString();
    if (idConcepto === "0" && gestora === 0) {
      this.activeIdParent(padreId, idConcepto, id);
      return;
    }
    this.isLoading = false;
    this.itemsConceptos = this.generalService.conceptoStorage;//this.listConceptos = this.generalService.conceptoStorage;
    this.buildTitle(concept);

    const conceptSelect: MenuConceptos[] = this.itemsConceptos.filter(resp => resp.pk == id);//this.listConceptos.filter(resp => resp.id == id)

    if (idConcepto !== "0" || gestora! > 0) {
      this.changSidenav.toggle();
    }

    if (conceptSelect[0].formulario > 1) {
      if (conceptSelect[0].formulario === 5 || conceptSelect[0].formulario === 4 || conceptSelect[0].formulario === 3 ||
        conceptSelect[0].formulario === 6 || conceptSelect[0].formulario === 7 || conceptSelect[0].formulario === 8 ||
        conceptSelect[0].formulario === 13 || conceptSelect[0].formulario === 14 || conceptSelect[0].formulario === 16 ||
        conceptSelect[0].formulario === 17 || conceptSelect[0].formulario === 12) {
          if(conceptSelect[0].formulario==8) {
            idConcepto = 4023;
          }
        //this.router.navigate(['/pagos/' + item, idConcepto, conceptSelect[0].formulario]);
        //return;
      }
      //this.router.navigate(['/pagos/' + item]);
      //return;
    }
    this.router.navigate(['/pagos/' + item, idConcepto, conceptSelect[0].formulario]);
    return;
  }

}


