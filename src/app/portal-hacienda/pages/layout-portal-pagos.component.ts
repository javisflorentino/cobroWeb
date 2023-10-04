import { Component } from '@angular/core';

@Component({
  selector: 'app-layout-portal-pagos',
  templateUrl: './layout-portal-pagos.component.html',
  styles: [
  ]
})
export class LayoutPortalPagosComponent {

  /* Se enviara a shared-sidenav-conceptos*/
  public sendActionSidenav: number = 0;
  public sendActEraseLocalStor: boolean = false;

  public valCard: number = 0;

  /* Recibe valor del shared-toolbar*/
  get actionOnSidenav() {
    console.log('Layoyt Recibe valor');
    this.sendActionSidenav = Math.random();
    console.log('Layoyt valor: ' + this.sendActionSidenav);
    return true;
  }

  reciveValCard(val:number) {
    console.log('Se recibe el valor de la tarjeta: ' + val);
    this.sendActionSidenav = val;
  }

  redirectHome(event: boolean): void {
    this.sendActEraseLocalStor = true;
  }
}
