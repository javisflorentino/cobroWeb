import { Component, OnInit } from '@angular/core';

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

  constructor() {}

  ngOnInit(): void {

  }


  activeLink = this.links[0];


  activeLinkFunct(link:number):void {
    this.activeLink = this.links[link];
    this.position[link] = true;
    this.position[(link>0)?0:1] = false;
  }

  getPoliza() {}

}
