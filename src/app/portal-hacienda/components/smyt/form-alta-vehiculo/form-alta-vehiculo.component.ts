import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import ListaTipoVehiculo from '../../../../../../data/arreglos/smyt_tipo_vehiculo.json';
import ListaOficinas from '../../../../../../data/arreglos/smyt_oficinas_tramite.json';
import { TipoVehiculo } from 'src/app/portal-hacienda/interface/portal-tipovehiculo.interface';
import { Oficinas } from 'src/app/portal-hacienda/interface/portal-oficinas.interface';
import { ValidatorsService } from '../../../../shared/services/validators.service';

@Component({
  selector: 'form-alta-vehiculo',
  templateUrl: './form-alta-vehiculo.component.html',
  styles: [
  ]
})
export class FormAltaVehiculoComponent implements OnInit {

  //declaracion de variable de tipo TipoVehiculo y se le agrega el arreglo
  public tipoVehiculoArr: TipoVehiculo[] = ListaTipoVehiculo;
  //declaracion de variable de tipo Oficina y se le agrega el arreglo
  public oficinasArr: Oficinas[] = ListaOficinas;

  @Output()
  private tipoVehiculoEmit = new EventEmitter<number>();


  public myFormShared!: FormGroup;
  constructor( private fb: FormBuilder, private validatorsService:ValidatorsService ) {

  }

  ngOnInit(): void {
    this.myFormShared = this.fb.group({
      oficina_tramite: ['',[Validators.required]],
      tipo_vehiculo: ['',[Validators.required]],
      no_serie: ['',[Validators.required]],
      no_serie2: ['',[Validators.required]],
      fecha_factura: [new Date(),Validators.required]
    },
    {
      validators: [
        this.validatorsService.isFieldOneEqualFielTwo('no_serie', 'no_serie2')
      ]
    });
  }

  changeFielVehicleType(value: any) {
    this.tipoVehiculoEmit.emit(value);
  }

  isValidField( field: string ) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField( this.myFormShared, field );
  }

}
