/*
  Renderiza los componentes estaticos y compartidos Sidenav y Toolbar
  Renderiza los componentes definidos como rutas
*/
import { Component, HostListener, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { SidenavConceptosComponent } from 'src/app/shared/components/sidenav-conceptos/sidenav-conceptos.component';

@Component({
  selector: 'app-layout-portal-pagos',
  templateUrl: './layout-portal-pagos.component.html',
  styles: [
  ]
})
export class LayoutPortalPagosComponent implements OnInit, OnChanges {

  /* las 2 variables se enviara a shared-sidenav-conceptos*/
  public sendActionSidenav: number = 0;
  public sendActEraseLocalStor: number = 0;

  /* se envia a shared-toolbar */
  public senNameDep: string = 'SECRETARÍA DE HACIENDA Y CRÉDITO PUBLICO';

  public valCard: number = 0;

  // Recibe el nombre del concepto de sidenav-conceptos y lo envia al shared-toolbar
  public receiveNameConcept!: string;

  productObservable!: Observable<number>;

  /*private sideNav!:SidenavConceptosComponent;

  @HostListener('click')
  clickOutside() {
      console.log(this.sideNav.changSidenav.toggle)
  }*/


  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {}

  /* Recibe valor del shared-toolbar*/
  get actionOnSidenav() {
    console.log('Layoyt Recibe valor');
    this.sendActionSidenav = Math.random();
    console.log('Layoyt valor: ' + this.sendActionSidenav);
    return true;
  }

  reciveValCard(val:number, nameDep: string) {
    this.sendActionSidenav = val;
    this.senNameDep = nameDep;
  }

  redirectHome(event: boolean): void {
    this.senNameDep = 'SECRETARIA DE HACIENDA Y CREDITO PUBLICO';
    this.receiveNameConcept = '';
    this.sendActEraseLocalStor = Math.random();
  }
  reciveNameConcept(nameConcep:string){
    this.receiveNameConcept = ' - [ ' + nameConcep + ' ]';
  }
}
