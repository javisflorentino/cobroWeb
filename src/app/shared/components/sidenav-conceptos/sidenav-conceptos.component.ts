import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MenuService } from '../../services/menu.service';
import { Conceptos } from '../../interfaces/shared-conceptos.interface';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';


@Component({
  selector: 'shared-sidenav-conceptos',
  templateUrl: './sidenav-conceptos.component.html',
  styles: [
  ]
})
export class SidenavConceptosComponent implements OnInit, OnChanges {


  @Input()
  public reciveActionSideNav!:number;

  @Input()
  public eraseLocalStor: number = 0;
  // Envia el valor al padre layout-portal-pagos
  @Output()
  private nameConcept = new EventEmitter<string>();
  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  private subConceptos: Conceptos[] = [];



  @ViewChild('sidenav')
  public changSidenav!: MatSidenav;

  public itemsConceptos: Conceptos[] = [];

  public showMessage: boolean = false;

  public showBack: boolean = false;


  constructor( private menuService: MenuService, private router: Router ) {}

  ngOnChanges(changes: SimpleChanges): void {

    if(this.changSidenav) {
      this.changSidenav.toggle();
      if ( this.eraseLocalStor ) {
        localStorage.clear();
        this.itemsConceptos = [];
        this.eraseLocalStor = 0;
        this.reciveActionSideNav = 0;
        this.showMessage = true;
        this.menuService.deleteLocalStorage();
        this.router.navigate(['/pagos']);
        return;
      }

      this.buildMenu();


    }
  }
  ngOnInit(): void { console.log(this.showMessage ) }

  buildMenu(padreId?: number) {
    this.isLoading = true;
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

  backMenu() {}

  /*subActionList(id: number) {
    this.menuService.requestSubConceptos(id)
        .subscribe( resp => {
          this.showBack  =true;
          this.isLoading = true;
          this.showMessage = false;
          this.itemsConceptos = this.menuService.conceptoStorage;
        });
  }*/

  actionList(item: string, concept: string, id: number, idConcepto: string|number) {
    idConcepto = idConcepto.toString();
    if ( idConcepto === "0" ) {
      this.reciveActionSideNav = id;
      this.buildMenu();
      this.showBack  = true;
      //return;
    }

    this.isLoading = true;
    //this.showMessage = false;
    this.itemsConceptos = this.menuService.conceptoStorage;

    const concep = (localStorage.getItem('concept'))?localStorage.setItem('concept',localStorage.getItem('concept') +  ' - ' + concept):localStorage.setItem('concept',concept);
    (concept.length>0)? concept += ' - ' + concept:concept;

    this.nameConcept.emit(concept);
    if ( idConcepto !== "0" ) this.changSidenav.toggle();
    //localStorage.setItem('concept',concept);
    this.router.navigate(['/pagos/'+item]);

    /*this.menuService.requestSubConceptos(id)
      .subscribe(resp => {
        if ( idConcepto === "0" && resp.length > 0 ) {
          this.showBack  =true;
          this.isLoading = false;
          this.showMessage = false;
          this.itemsConceptos = this.menuService.conceptoStorage;

          this.subConceptos = resp;
          console.log(this.subConceptos)
          return;
        }
        this.nameConcept.emit(concept);
        this.changSidenav.toggle();
        localStorage.setItem('concept',concept);
        this.router.navigate(['/pagos/'+item]);
      });*/


    /*this.changSidenav.toggle();
    localStorage.setItem('concept',concept);
    this.router.navigate(['/pagos/'+item]);*/
  }

}


