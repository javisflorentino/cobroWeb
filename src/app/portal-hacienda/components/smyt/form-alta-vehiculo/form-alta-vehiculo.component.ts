import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'form-alta-vehiculo',
  templateUrl: './form-alta-vehiculo.component.html',
  styles: [
  ]
})
export class FormAltaVehiculoComponent implements OnInit {

  public myFormShared!: FormGroup;
  constructor( private fb: FormBuilder ) {

  }

  ngOnInit(): void {
    console.log('Se dispara FormAltaVhiculo');
    this.myFormShared = this.fb.group({
      oficina_tramite: ['',[Validators.required]],
      tipo_vehiculo: ['',[Validators.required]],
      no_serie: ['',[Validators.required]],
      no_serie2: ['',[Validators.required]],
      fecha_factura: [new Date(),Validators.required]
    });
  }

}
