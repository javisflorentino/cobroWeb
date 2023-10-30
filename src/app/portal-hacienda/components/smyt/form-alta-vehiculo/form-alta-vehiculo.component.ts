import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import ListaTipoVehiculo from '../../../../../../data/arreglos/smyt_tipo_vehiculo.json';
import ListaOficinas from '../../../../../../data/arreglos/smyt_oficinas_tramite.json';
import ListMessageSmyt from '../../../../../../data/arreglos/smyt_mensajes.json'

import { TipoVehiculo } from 'src/app/portal-hacienda/interface/portal-tipovehiculo.interface';
import { Oficinas } from 'src/app/portal-hacienda/interface/portal-oficinas.interface';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';
import { Moment } from 'moment';

@Component({
  selector: 'form-alta-vehiculo',
  templateUrl: './form-alta-vehiculo.component.html',
  styles: [
  ]
})
export class FormAltaVehiculoComponent implements OnInit {

  public mssgArr: MessageSmyt[] = ListMessageSmyt.smyt_alta_vehiculo;

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
      fecha_factura: ['',Validators.required]
    },
    {
      validators: [
        this.validatorsService.isFieldOneEqualFielTwo('no_serie', 'no_serie2',1),
        this.validatorsService.validateDateGreat(new Date, 'fecha_factura',2)
      ]
    });
    //this.myFormShared.markAllAsTouched();
  }

  changeFielVehicleType(value: any) {
    this.tipoVehiculoEmit.emit(value);
  }

  isValidField( field: string ) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField( this.myFormShared, field );
  }

  getMessage(idMssg:number, nameField:string) {
    console.log(this.myFormShared.value)
    let touched = this.myFormShared.get(nameField)?.touched;
    let nameFileValue = this.myFormShared.get(nameField)?.value;
    let pathSelect = this.validatorsService.alfaPath;
    if(nameField==='fecha_factura'){
      console.log('getMessage_Form-Alta_1::' + nameField)
      let nameFileValue: Moment = this.myFormShared.get(nameField)?.value;
      let pathSelect = this.validatorsService.datePath;
      console.log('nameFileValue-Fecha: ' + nameFileValue)
    }
    //console.log('nameFileValue: ' + nameFileValue)
    if(idMssg !== null) {
      console.log('getMessage_Form-Alta_2: ' + idMssg)
      const message = this.mssgArr.filter(({id}) => id == idMssg );
      return message[0].msg;
    }
    if( touched ) {
      let idMessage=100;
      console.log('getMessage_Form-Alta_3')

      let pattern = new RegExp(pathSelect);
      if(!pattern.test(nameFileValue) || nameFileValue == null) {
        console.log('getMessage_Form-Alta_4')
        const message = this.mssgArr.filter(({id}) => id == idMessage );
        this.myFormShared.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );
        return message[0].msg;
      }

    }
    console.log('getMessage_Form-Alta_5')
    return '';
  }

}
