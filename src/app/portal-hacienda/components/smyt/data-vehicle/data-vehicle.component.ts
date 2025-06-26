import { Component, EventEmitter, HostListener, Inject, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import moment from 'moment';
import { TipoMotor } from 'src/app/portal-hacienda/interface/portal-tipomotor.interface';
import { TipoVehiculo } from 'src/app/portal-hacienda/interface/portal-tipovehiculo.interface';
//import { TipoVehiculo } from 'src/app/portal-hacienda/interface/struct-tipovehiculo.interface';

import { office } from 'src/app/portal-hacienda/interface/struct-oficina.interface';
import { SmytValidatorService } from 'src/app/portal-hacienda/services/smyt-validator.service';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';

import MessagesLists from '../../../../../../data/arreglos/smyt_mensajes.json'
import ListaTipoVehiculo from '../../../../../../data/arreglos/smyt_tipo_vehiculo.json';


@Component({
  selector: 'smyt-data-vehicle',
  templateUrl: './data-vehicle.component.html',
  styleUrls: ['./data-vehicle.component.css']
})
export class DataVehicleComponent implements OnInit {
  private smytService = inject(SmytService);

  public formBlock = signal<boolean>(true);

  private validatorsService = inject(SmytValidatorService);

  //public tipoVehiculoArr = signal<TipoVehiculo[]>([]);
  public tipoVehiculoArr: TipoVehiculo[] = ListaTipoVehiculo;


  //declaracion de variable de tipo de motor
  public tipoMotor = signal<TipoMotor[]>([]);

  public disablesOffice:boolean = false;

  @Input({required:true})
  public disablesSerie:boolean = false;

  @Input({required:true})
  public disablesValorVenta:boolean = false;

  @Input({required:true})
  public disabledPlaca:boolean = false;

  @Input({required:true})
  public disabledTipoV:boolean = false;

  @Input({required:true})
  public disablesSerieSec:boolean = false;

  @Input({required:true})
  public disableDate:boolean = false;

  @Input({required:true})
  public disableTipoMotor:boolean = false;

  @Input({required:true})
  public disablesValorFactura:boolean = false;


  @Output()
  private tipoVehiculoEmit = new EventEmitter<number>();


  private fb = inject(FormBuilder);
  public myFormSmyt: FormGroup = this.fb.group({
    oficina:       [{value:'',disabled:!this.disablesOffice}, [Validators.required]],
    tipo_vehiculo: [{value:'',disabled:!this.disabledTipoV},[Validators.required]],
    placa:         [{value:'',disabled:!this.disabledPlaca}, [Validators.required]],
    tipo_motor:    [{value:'',disabled:!this.disabledPlaca},[Validators.required]],
    serie:         [{value:'',disabled:!this.disablesSerie}, [Validators.required]],
    seriesec:      [{value:'',disabled:!this.disablesSerieSec},[Validators.required]],
    valor_venta:   [{value:'',disabled:!this.disablesValorVenta}, [Validators.required, Validators.min(40)]],
    fecha_factura: [new Date(),[Validators.required, this.validatorsService.cantBeGreat]],
    valor_factura: [{value:'',disabled:!this.disablesValorFactura}, [ Validators.required, Validators.pattern(this.validatorsService.numberPattern)]],
  },{
    validators: [
      this.validatorsService.existsPlaca('placa',1, 1, '1'),
      this.validatorsService.existsSerie('placa','serie',3, 2, '1'),
      this.validatorsService.isFieldOneEqualFielTwo('serie', 'seriesec',1),
    ]
  });

  public officeList = signal<office[]>([]);
  public mssgArr = signal<MessageSmyt[]>(MessagesLists.smyt_alta_vehiculo);

  /* NOTA: CONVIERTE TODAS LAS ENTRADAS DE TEXTO EN MAYUSCULAS */
  @HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  constructor(
    private _adapter: DateAdapter<any>,
    private _intl: MatDatepickerIntl,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
  ) {

  }

  ngOnInit(): void {
    this._locale = 'es';
    this._adapter.setLocale(this._locale);

    this.smytService.getOficinas()
      .subscribe({
        next:(resp) => {
          this.officeList.set(resp.data);
        },
        error: (err) => {
          console.log(err);
        }
      });

    /*this.smytService.getTipoVahiculo()
      .subscribe({
        next:(resp) => {
          this.tipoVehiculoArr.set(resp.data);
        },
        error: (err) => {
          console.log(err);
        }
      });*/


    this.smytService.getTipoMotor()
    .subscribe({
      next: (resp) => {
        this.tipoMotor.set(resp.data);
      },
      error: (err) => {
        console.log(err);
      }
    })//tipoMotor
  }

  getMessageDate(idMssg:number, nameField:string) {
    let nameFileValue = moment(this.myFormSmyt.get(nameField)?.value).toDate();
    let pathSelect = this.validatorsService.datePath;
    let stringVal = nameFileValue.getDate()+'/'+(nameFileValue.getMonth()+1)+'/'+nameFileValue.getFullYear();

    let pattern = new RegExp(pathSelect);
      if(!pattern.test(stringVal) || nameFileValue == null) {
        const message = this.mssgArr().filter(({id}) => id == 100 );
        this.myFormSmyt.get(nameField)?.setErrors( { notEqual: true, error:100 } );
        return message[0].msg;
      }
      return '';
  }

  getMessage(idMssg:number, nameField:string) {
    let touched = this.myFormSmyt.get(nameField)?.touched;
    let nameFileValue = this.myFormSmyt.get(nameField)?.value;
    let pathSelect = this.validatorsService.alfaPath;

    if(idMssg !== null && idMssg !== undefined) {
      const message = this.mssgArr().filter(({id}) => id == idMssg );
      return message[0].msg;
    }
    if( touched ) {
      let idMessage=101;
      if(nameField==='fecha_factura'){
        idMessage = 100;
        nameFileValue = this.myFormSmyt.get(nameField)?.value;
        pathSelect = this.validatorsService.datePath;
        this.getMessageDate(idMssg, nameField);

      }

      let pattern = new RegExp(pathSelect);
      if(!pattern.test(nameFileValue) || nameFileValue == null) {
        const message = this.mssgArr().filter(({id}) => id == idMessage );
        this.myFormSmyt.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );
        return message[0].msg;
      }

    }
    return '';
  }

  changeFielVehicleType(value: any) {
    this.tipoVehiculoEmit.emit(value);
    if(!this.disableTipoMotor){
      if(value=='5'){
        this.myFormSmyt.get('tipo_motor')?.disable()
      } else {
        this.myFormSmyt.get('tipo_motor')?.enable()
      }
    }
  }
}
