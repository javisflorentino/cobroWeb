import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import ListaTipoVehiculo from '../../../../../../data/arreglos/smyt_tipo_vehiculo.json';
import ListaTipoMotor from '../../../../../../data/arreglos/smyt_tipo_motor.json';
import ListaOficinas from '../../../../../../data/arreglos/smyt_oficinas_tramite.json';
import ListMessageSmyt from '../../../../../../data/arreglos/smyt_mensajes.json'

import { TipoVehiculo } from 'src/app/portal-hacienda/interface/portal-tipovehiculo.interface';
import { Oficinas } from 'src/app/portal-hacienda/interface/portal-oficinas.interface';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';

import moment from 'moment';
import { TipoMotor } from 'src/app/portal-hacienda/interface/portal-tipomotor.interface';

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
  //declaracion de variable de tipo de motor
  public tipoMotor: TipoMotor[] = ListaTipoMotor;

  @Output()
  private tipoVehiculoEmit = new EventEmitter<number>();


  public myFormShared!: FormGroup;
  constructor( private fb: FormBuilder, private validatorsService:ValidatorsService ) {

  }

  ngOnInit(): void {
    this.myFormShared = this.fb.group({
      oficina_tramite: [1,[Validators.required]],
      tipo_vehiculo: [1,[Validators.required]],
      tipo_motor: ['',[Validators.required]],
      no_serie: ['',[Validators.required]],
      no_serie2: ['',[Validators.required]],
      fecha_factura: [new Date(),[Validators.required, this.validatorsService.cantBeGreat]],
      valor_factura:[ '', [ Validators.required, Validators.pattern(this.validatorsService.numberPattern)]],
    },
    {
      validators: [
        this.validatorsService.isFieldOneEqualFielTwo('no_serie', 'no_serie2',4),
        this.validatorsService.existsSeries('no_serie', '',3,2,'tipo_vehiculo','fecha_factura')
      ]
    });
    //this.myFormShared.markAllAsTouched();
  }

  changeFielVehicleType(value: any) {
    this.tipoVehiculoEmit.emit(value);
    if(value=='5'){
      this.myFormShared.get('tipo_motor')?.disable()
    } else {
      this.myFormShared.get('tipo_motor')?.enable()
    }
  }

  isValidField( field: string ) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField( this.myFormShared, field );
  }
  getMessageDate(idMssg:number, nameField:string) {
    let nameFileValue = moment(this.myFormShared.get(nameField)?.value).toDate();
    let pathSelect = this.validatorsService.datePath;
    let stringVal = nameFileValue.getDate()+'/'+(nameFileValue.getMonth()+1)+'/'+nameFileValue.getFullYear();

    let pattern = new RegExp(pathSelect);
      if(!pattern.test(stringVal) || nameFileValue == null) {
        const message = this.mssgArr.filter(({id}) => id == 100 );
        this.myFormShared.get(nameField)?.setErrors( { notEqual: true, error:100 } );
        return message[0].msg;
      }
      return '';
  }
  getMessage(idMssg:number, nameField:string) {
    let touched = this.myFormShared.get(nameField)?.touched;
    let nameFileValue = this.myFormShared.get(nameField)?.value;
    let pathSelect = this.validatorsService.alfaPath;


    if(idMssg !== null) {
      const message = this.mssgArr.filter(({id}) => id == idMssg );
      return message[0].msg;
    }
    if( touched ) {
      let idMessage=101;
      if(nameField==='fecha_factura'){
        idMessage = 100;
        nameFileValue = this.myFormShared.get(nameField)?.value;
        pathSelect = this.validatorsService.datePath;
        this.getMessageDate(idMssg, nameField);

      }

      let pattern = new RegExp(pathSelect);
      if(!pattern.test(nameFileValue) || nameFileValue == null) {
        const message = this.mssgArr.filter(({id}) => id == idMessage );
        this.myFormShared.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );
        return message[0].msg;
      }

    }
    return '';
  }

}
