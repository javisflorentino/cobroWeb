import { Component } from '@angular/core';

@Component({
  selector: 'smyt-licencia-vehiculo',
  templateUrl: './licencia-vehiculo.component.html',
  styleUrls: ['./licencia-vehiculo.component.css']
})
export class LicenciaVehiculoComponent {

  public buttBlock: boolean = true;
  public formBlock: boolean = true;

  constructor() {}

  onSubmit() {}

  tieneLicencia(event:number) {

    if ( event == 1 ) {
      this.formBlock = false;
    }

  }

}
