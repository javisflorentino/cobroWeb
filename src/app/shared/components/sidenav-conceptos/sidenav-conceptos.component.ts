import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MenuService } from '../../services/menu.service';
import { Conceptos } from '../../interfaces/shared-conceptos.interface';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';

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

  private subConceptos: Conceptos[] = [];


  //Controla las acciones sobre el icono de menu de SideNav
  @ViewChild('sidenav')
  public changSidenav!: MatSidenav;

  public itemsConceptos: Conceptos[] = [];

  public showMessage: boolean = false;
  //Mostrar el icono de Back. Se usa en el caso de menus anidados
  public showBack: boolean = false;


  constructor( private menuService: MenuService, private router: Router ) {}

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
    console.log(this.showMessage )
  }

  processChangeOnView() {
    if(this.changSidenav.opened == false )
      this.changSidenav.open();
    //this.changSidenav.toggle();
    if ( this.eraseLocalStor ) {
      localStorage.clear();
      this.itemsConceptos = [];
      this.eraseLocalStor = 0;
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


    this.menuService.requestConceptos(this.reciveActionSideNav)
      .subscribe(conceptos => {
        if ( conceptos.length > 0) {
          this.showMessage = false;
          this.itemsConceptos = conceptos
          this.isLoading = false;
          return;
        }

        this.itemsConceptos = [];
        this.showMessage = true;
        console.log(this.showMessage )
        this.isLoading = false;
        //this.itemsConceptos[0].textoTitulo='sin informacion';
      });


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
    const concep = (localStorage.getItem('concept'))?
      localStorage.setItem('concept',localStorage.getItem('concept') +  ' - ' + concept):
      localStorage.setItem('concept',concept);
    //(concept.length>0)? concept += ' - ' + concept:concept;

    //localStorage.setItem('idConcepto',idConcepto);

    this.nameConcept.emit(concept);
  }

  actionList(item: string, concept: string, id: number, idConcepto: string|number, padreId: number) {

    idConcepto = idConcepto.toString();
    if ( idConcepto === "0" ) {
      console.log(padreId)
      let x: IdPadre[] = JSON.parse(localStorage.getItem('idParent')!);
      console.log( x)
      if(x) {
        x.forEach(() =>  x.push({'padreId':padreId}))
        localStorage.setItem('idParent',JSON.stringify(x))
      } else {
        localStorage.removeItem('concept');
        localStorage.setItem('idParent',JSON.stringify([{'padreId':padreId}]))
      }
      this.buildTitle(concept);
      this.reciveActionSideNav = id;
      this.buildMenu(Number.parseInt(idConcepto));
      this.showBack  = true;
      return;
    }

    this.isLoading = true;
    //this.showMessage = false;
    this.itemsConceptos = this.menuService.conceptoStorage;
    if(!localStorage.getItem('idParent')) {
      localStorage.removeItem('concept');

    }
    this.buildTitle(concept);

    const conceptSelect: Conceptos[] = this.itemsConceptos.filter(resp => resp.id == id )

    if ( idConcepto !== "0" ) this.changSidenav.toggle();
    //localStorage.setItem('concept',concept);
    if (conceptSelect[0].opcionFormulario > 1) {
      this.router.navigate(['/pagos/'+item]);
      return;
    }
    this.router.navigate(['/pagos/'+item,idConcepto,conceptSelect[0].opcionFormulario]);
  }

}


