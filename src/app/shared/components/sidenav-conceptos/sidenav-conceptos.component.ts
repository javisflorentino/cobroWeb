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



  @ViewChild('sidenav')
  public changSidenav!: MatSidenav;

  public itemsConceptos: Conceptos[] = [];

  public showMessage: boolean = false;


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

  buildMenu() {
    console.log('Dep: ' + this.reciveActionSideNav);
    if ( this.menuService.conceptoStorage.length > 0 && (this.reciveActionSideNav%1)>0) {
      console.log('Lleno')
      this.showMessage = false;
      this.itemsConceptos = this.menuService.conceptoStorage;
      return ;
    }
    console.log('No Lleno')
    this.menuService.requestConceptos(this.reciveActionSideNav)
      .subscribe(conceptos => {
        if ( conceptos.length > 0) {
          console.log('No Lleno 1')
          this.showMessage = false;
          this.itemsConceptos = conceptos
          return;
        }
        console.log('No Lleno 2')
        this.itemsConceptos = [];
        this.showMessage = true;
        console.log(this.showMessage )
        //this.itemsConceptos[0].textoTitulo='sin informacion';
      });


    return;
  }

  destroyLocalStorAndArray() {
    localStorage.clear();
    this.itemsConceptos=[];
  }

  actionList(item: string, concept: string) {
    this.nameConcept.emit(concept);
    this.changSidenav.toggle();
    localStorage.setItem('concept',concept);
    this.router.navigate(['/pagos/'+item]);
  }

}


