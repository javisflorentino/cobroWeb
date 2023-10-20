import { Component, OnInit } from '@angular/core';
import { Poliza } from 'src/app/portal-hacienda/interface/portal-datos-poliza.interface';

@Component({
  selector: 'app-shared-datos-poliza',
  templateUrl: './shared-datos-poliza.component.html',
  styles: [
  ]
})
export class SharedDatosPolizaComponent implements OnInit {

  public links = ['Deepósito Bancario', 'Tarjeta de Crédito o Débito'];
  public links_icons = ['account_balance','credit_card'];
  public position: boolean[] = [true,false];

  private url = 'https://www.hacienda.morelos.gob.mx/polizasweb/admin/index.php?lineacaptura=';

  public datosPoliza:Poliza = {
    fechaVencimiento: '',
    numeroPoliza:     '',
    lineaCaptura:     '',
    total:            0,
  };

  constructor() {}

  ngOnInit(): void {
    this.datosPoliza = JSON.parse(localStorage.getItem('datos_poliza')!);
  }


  activeLink = this.links[0];


  activeLinkFunct(link:number):void {
    console.log('entra = ' + link)
    this.activeLink = this.links[link];
    this.position[link] = true;
    this.position[(link>0)?0:1] = false;
  }

  getPoliza() {
    window.open(`${this.url}${this.datosPoliza.lineaCaptura}`);
  }

}
