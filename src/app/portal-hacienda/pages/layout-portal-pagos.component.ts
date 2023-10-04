/*
  Renderiza los componentes estaticos y compartidos Sidenav y Toolbar
  Renderiza los componentes definidos como rutas
*/
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-layout-portal-pagos',
  templateUrl: './layout-portal-pagos.component.html',
  styles: [
  ]
})
export class LayoutPortalPagosComponent implements OnInit, OnChanges {

  /* Se enviara a shared-sidenav-conceptos*/
  public sendActionSidenav: number = 0;
  public sendActEraseLocalStor: boolean = false;

  /* se envia a shared-toolbar */
  public senNameDep: string = '';

  public valCard: number = 0;

  // Recibe el nombre del concepto de sidenav-conceptos y lo envia al shared-toolbar
  public receiveNameConcept: string = '';

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Nombre del concepto OnChange: ' + this.receiveNameConcept);
  }

  ngOnInit(): void {
    console.log('Nombre del concepto' + this.receiveNameConcept);
  }

  /* Recibe valor del shared-toolbar*/
  get actionOnSidenav() {
    console.log('Layoyt Recibe valor');
    this.sendActionSidenav = Math.random();
    console.log('Layoyt valor: ' + this.sendActionSidenav);
    return true;
  }

  reciveValCard(val:number, nameDep: string) {
    console.log('Se recibe el valor de la tarjeta: ' + val);
    this.sendActionSidenav = val;
    this.senNameDep = nameDep;
  }

  redirectHome(event: boolean): void {
    this.sendActEraseLocalStor = true;
  }
}
