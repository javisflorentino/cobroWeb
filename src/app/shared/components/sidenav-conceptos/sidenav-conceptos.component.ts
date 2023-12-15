import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, signal } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MenuService } from '../../services/menu.service';
import { Conceptos } from '../../interfaces/shared-conceptos.interface';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription, filter } from 'rxjs';

/* OBTIENE LA LISTA DE CONCEPTOS QUE PERMITEN AGREGAR MAS CONCEPTOS */
import ListaMasConceptos from '../../../../../data/arreglos/agregar_mas_conceptos.json'
import { MoreConcept } from '../../interfaces/shared-conceptos_mas_conceptos';

export interface IdPadre {
  padreId: number
}


@Component({
  selector: 'shared-sidenav-conceptos',
  templateUrl: './sidenav-conceptos.component.html',
  styles: [
  ]
})
export class SidenavConceptosComponent implements OnInit, OnChanges {

  //Recibe de Layout el valor del concepto seleccionado
  @Input()
  public reciveActionSideNav!:number;
  // Variable de tipo Observable que recible el valor de la dependencia por parte de Layout
  @Input ()
  public reciveValCard: Observable<number> = new Observable<number>();

  @Input()
  public eraseLocalStor: number = 0;
  // Envia el valor al padre layout-portal-pagos "Nombre del Concepto"
  @Output()
  private nameConcept = new EventEmitter<string>();
  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* CONTROLA LA LISTA DE CONCEPTOS QUE PERMITEN AGREGAR MAS CONCEPTOS */
  private listaConceptos : MoreConcept= ListaMasConceptos;

  private subConceptos: Conceptos[] = [];

  /* Father Alert  */
  @Output()
  public fathAlert = new EventEmitter;

  //Controla las acciones sobre el icono de menu de SideNav
  @ViewChild('sidenav')
  public changSidenav!: MatSidenav;

  public itemsConceptos: Conceptos[] = [];

  public showMessage: boolean = false;
  //Mostrar el icono de Back. Se usa en el caso de menus anidados
  public showBack: boolean = false;


  constructor( private menuService: MenuService, private router: Router ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.changSidenav) {
      this.processChangeOnView();
    }
  }

  ngOnInit(): void {
    /* Obsevable que se queda en espera de cambios en lo recivido por parte de Layout  */
    this.reciveValCard.subscribe(dep => {
      this.reciveActionSideNav = dep;
      this.processChangeOnView();
    });
  }

  processChangeOnView() {
    if(this.changSidenav.opened == false )
      this.changSidenav.open();
    //this.changSidenav.toggle();
    if ( this.eraseLocalStor ) {
      localStorage.clear();
      this.itemsConceptos = [];
      this.eraseLocalStor = 0;
      this.changSidenav.toggle();
      this.reciveActionSideNav = 0;
      this.showMessage = true;
      this.showBack = false;
      this.menuService.deleteLocalStorage();
      this.router.navigate(['/pagos']);
      return;
    }
    this.buildMenu();
  }

  buildMenu(padreId?: number) {
    this.isLoading = true;
    if(!localStorage.getItem('idParent'))
      this.showBack = false;

    if ( this.menuService.conceptoStorage.length > 0 && (this.reciveActionSideNav%1)>0) {
      this.isLoading = false;
      this.showMessage = false;
      this.itemsConceptos = this.menuService.conceptoStorage;
      return ;
    }

    /* DESCOMENTAR LAS LINEAS DE LA 98 - 110 SI SE VA A CONSUMIR SERVICIO */
    /*this.menuService.requestConceptos(this.reciveActionSideNav)
      .subscribe(conceptos => {
        if ( conceptos.length > 0) {
          this.showMessage = false;
          this.itemsConceptos = conceptos
          this.isLoading = false;
          return;
        }

        this.itemsConceptos = [];
        this.showMessage = true;
        this.isLoading = false;
      });*/

      /* COMENTAR LAS LINEAS DE LA 113 - 121 SI SE VA A CONSUMIR SERVICIO */
      this.itemsConceptos = this.menuService.requestConceptos(this.reciveActionSideNav)
      if (this.itemsConceptos.length > 0) {
        this.showMessage = false;
        this.isLoading = false;
        return;
      }
      this.itemsConceptos = [];
      this.showMessage = true;
      this.isLoading = false;

    return;
  }

  destroyLocalStorAndArray() {
    localStorage.clear();
    this.itemsConceptos=[];
  }

  backMenu() {
     let idParent: IdPadre[]= JSON.parse(localStorage.getItem('idParent')!);
     this.reciveActionSideNav = idParent[idParent.length -1].padreId;
     idParent.pop();
     if(idParent.length===0) {
      localStorage.removeItem('idParent')
      this.buildMenu();
      return;
     }
     localStorage.setItem('idParent',JSON.stringify(idParent))
     this.buildMenu();

     //this.reciveActionSideNav = idParent.padreId;

  }

  buildTitle(concept: string) {
    localStorage.setItem('concept',concept);
    //(concept.length>0)? concept += ' - ' + concept:concept;

    //localStorage.setItem('idConcepto',idConcepto);

    this.nameConcept.emit(concept);
  }

  dellLocalStore() {
    //if(localStorage.getItem('concept'))
    //  localStorage.removeItem('concept');
    //if(localStorage.getItem('contribuyente') && !localStorage.getItem('idParent'))
    //  localStorage.removeItem('contribuyente');
    if(localStorage.getItem('contribuyente_only'))
      localStorage.removeItem('contribuyente_only');
    //if(localStorage.getItem('route_origen'))
    //  localStorage.removeItem('route_origen');
    if(localStorage.getItem('vehicle_data'))
      localStorage.removeItem('vehicle_data');
    if(localStorage.getItem('vehicle_data_adicional'))
      localStorage.removeItem('vehicle_data_adicional');
    if(localStorage.getItem('datos_poliza'))
      localStorage.removeItem('datos_poliza');
    if(localStorage.getItem('datos_cobro'))
      localStorage.removeItem('datos_cobro');
  }
  /*
    NOTA:  DETERMINA SI EL CONCEPTO PERMITE AGREGAR MAS CONCEPTOS DE SU SECCION
    MODIF: 12/12/2023
  */
  generalLocalStorRepetirConcept(idConcepto:string|number) {
    let flat:boolean = false;
    Object.keys(this.listaConceptos).forEach((k,v) => {
      this.listaConceptos[k as keyof MoreConcept].filter(resp =>{
        if (resp.concepto == idConcepto) {
          localStorage.setItem('repetir_concepto',JSON.stringify(this.listaConceptos[k as keyof MoreConcept]));
          flat = true;
        }
      });
    });
    if(flat) return;

    localStorage.removeItem('contribuyente');
    localStorage.removeItem('repetir_concepto');
  }

  actionList(item: string, concept: string, id: number, idConcepto: string|number, padreId: number, gestora?:number) {

    //console.log(item + '-' + concept + '-' + id + '-' + idConcepto + '-' + padreId + '-' + gestora)
    /*
      NOTA:  DETERMINA SI EL CONCEPTO PERMITE AGREGAR MAS CONCEPTOS DE SU SECCION
      MODIF: 12/12/2023
    */
    if(Number(gestora)>0) {
      if(!localStorage.getItem('repetir_concepto')) {
          this.generalLocalStorRepetirConcept(idConcepto);
      } else {
          const repetir_concepto = JSON.parse(localStorage.getItem('repetir_concepto')!);
          const resp = Object.keys(repetir_concepto).filter(k => repetir_concepto[k].concepto == idConcepto)
          if (resp.length==0) {
            this.fathAlert.emit('El concepto seleccionado no perteneceal mismo grupo, <br>Se borrarán los conceptos previamente seleccionados.  ');
            //localStorage.removeItem('repetir_concepto');
            this.generalLocalStorRepetirConcept(idConcepto);
          }
      }
    }

    if (new RegExp('^(?:https?):\/\/?').test(item)) {
      window.open(`${item}`);
      return;
    }

    this.dellLocalStore();

    localStorage.setItem('gestora',String(gestora));
    localStorage.setItem('route_origen',item);

    idConcepto = idConcepto.toString();
    if ( idConcepto === "0" ) {
      let x: IdPadre[] = JSON.parse(localStorage.getItem('idParent')!);
      if(x) {
        x.forEach(() =>  x.push({'padreId':padreId}))
        localStorage.setItem('idParent',JSON.stringify(x))
      } else {
        //localStorage.removeItem('concept');
        localStorage.setItem('idParent',JSON.stringify([{'padreId':padreId}]))
      }
      //this.buildTitle(concept);
      this.reciveActionSideNav = id;
      this.buildMenu(Number.parseInt(idConcepto));
      this.showBack  = true;
      return;
    }
    //localStorage.setItem('idConcepto',idConcepto);
    //this.dellLocalStore();

    this.isLoading = true;
    //this.showMessage = false;
    this.itemsConceptos = this.menuService.conceptoStorage;
    /*if(!localStorage.getItem('idParent')) {
      localStorage.removeItem('concept');

    }*/
    this.buildTitle(concept);

    const conceptSelect: Conceptos[] = this.itemsConceptos.filter(resp => resp.id == id )

    if ( idConcepto !== "0" ){
      this.changSidenav.toggle();
    }

    if (conceptSelect[0].opcionFormulario > 1) {
      if (conceptSelect[0].opcionFormulario === 5 || conceptSelect[0].opcionFormulario === 4 || conceptSelect[0].opcionFormulario === 3 ||
        conceptSelect[0].opcionFormulario === 6 || conceptSelect[0].opcionFormulario === 7 || conceptSelect[0].opcionFormulario === 8 ||
        conceptSelect[0].opcionFormulario === 13 || conceptSelect[0].opcionFormulario === 14 || conceptSelect[0].opcionFormulario === 16 ||
        conceptSelect[0].opcionFormulario === 17 || conceptSelect[0].opcionFormulario === 12) {
        console.log(item +' ° ' + '/pagos/'+item,idConcepto,conceptSelect[0].opcionFormulario);
        this.router.navigate(['/pagos/'+item,idConcepto,conceptSelect[0].opcionFormulario]);
        return;
      }
      this.router.navigate(['/pagos/'+item]);
      return;
    }
    this.router.navigate(['/pagos/'+item,idConcepto,conceptSelect[0].opcionFormulario]);
  }

}


