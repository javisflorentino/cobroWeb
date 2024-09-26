import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { Router } from '@angular/router';
import { DatosPoliza } from '../../interfaces/datos-poliza';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TopLevel } from '../../interfaces/calculo-conceptos';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { Municipios } from 'src/app/portal-hacienda/interface/municipios';

/* arreglo de datos */
import ListaMunicipios from '../../../../../data/arreglos/municipios.json';
import ListMessageSmyt from '../../../../../data/arreglos/smyt_mensajes.json'

import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { ValidatorsService } from '../../services/validators.service';
import { MessageSmyt } from '../../interfaces/message-smyt.interface';
import { VehicleData } from '../../interfaces/vehicle-data';
import { TipoServicio } from '../../interfaces/tipo_servicios.enum';
import { Observable, filter } from 'rxjs';
import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
import { ComboConcept } from 'src/app/portal-hacienda/interface/datos-combo.interface';
import { ReintegrosStruct } from 'src/app/portal-hacienda/interface/reintegros-struct.interface';

@Component({
  selector: 'shared-datos-contribuyente',
  templateUrl: './datos-contribuyente.component.html',
  styleUrls: ['./datos-contribuyente.component.css']
})
export class DatosContribuyenteComponent implements OnInit {

  public mssgArr: MessageSmyt[] = ListMessageSmyt.smyt;
  public arrMunicipios: ComboConcept[] = [];//Municipios[] = ListaMunicipios;
  public arrEstados: ComboConcept[] = [];
  private cadenaError: string = '';
  public tipoPersona: string = 'F';

  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  public contribuyenteArr = {} as TopLevel;
  public contribDom: Object[] = [];

  public messages: Messages[] = [];
  public messages_other: Messages[] = [];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  public dataPoliza = {} as DatosPoliza;

  public TaxDataControl: boolean = true;

  // estos informacion se enviará desde el modulo de SMYT
  //private sistema: number = 64;//46;
  private movimiento: number = 100

  public myFormContribuyente: FormGroup = this.fb.group({
    tipoPersona: ['F',[Validators.required]],
    nombre: ['',[Validators.required]],
    primerApellido: ['', [Validators.required]],
    segundoApellido: ['', [Validators.required]],
    razonSocial: [{value: '', disabled: true},[Validators.required]],
    rfc: ['XAXX010101000', [Validators.required, Validators.pattern(this.validatosService.rfcFisica)]],
    curp: [''],
    domicilio: this.fb.group({
      calle: ['', [Validators.required]],
      numeroExterior: ['', [Validators.required]],
      numeroInterior: [],
      colonia: ['', [Validators.required]],
      codigoPostal: ['', [Validators.required, Validators.pattern(this.validatosService.exprCp)]],
      estados: [{value: '17', disabled: true},[Validators.required, Validators.min(1)]],
      municipio: ['',[Validators.required, Validators.min(1)]],
      observaciones: []
    }/*,
    {
      validators:[this.validatosService.validateDataInput('calle',4,'domicilio'),
        this.validatosService.validateDataInput('numeroExterior',5,'domicilio'),
        this.validatosService.validateDataInput('colonia',6,'domicilio'),
        this.validatosService.validateDataInput('codigoPostal',7,'domicilio'),
      ]
    }*/
    )
  },
  {
    validators:[this.validatosService.validateDataInput('nombre',1,'contribuyente'),
      this.validatosService.validateDataInput('primerApellido',2,'contribuyente'),
      this.validatosService.validateDataInput('segundoApellido',3,'contribuyente'),
      this.validatosService.validateDataInput('razonSocial',8,'contribuyente')
    ],
  }
  );

  constructor(
    private fb:FormBuilder,
    private router: Router,
    private _snackBar: MatSnackBar,
    private smytService: SmytService,
    private validatosService: ValidatorsService,
    private serviciosGenerales: GeneralesService
  ) { }

  @HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  ngOnInit(): void {
    if(!localStorage.getItem('contribuyente')) {
      this.openSnackBar('No se cuenta con información para continuar con el proceso')
      setTimeout(()=>{
        this.router.navigate(['pagos']);
      },2500);

    }
    /*
      OBTIENE LISTA DE ENTIDADES FEDERATIVAS
      MODIF: 12/12/2023
    */
    this.serviciosGenerales.getEntidadesFederativas().subscribe(resp => {
      if(!resp){
        this.openSnackBar('Problema con el API-SERVER, favor de contactar a Servicio Técnico ');
      } else {
        let route_origen:string = localStorage.getItem('route_origen')!;
        if (route_origen.includes('smyt-licencia')){
          this.openSnackBar('Si ya cuenta con una licencia expedida por el Gobierno del Estado de Morelos, favor de anotar el número en observaciones')
        }



        this.arrEstados = resp?.data;
        this.myFormContribuyente.get('domicilio')?.get('estados')?.setValue(17);
        if(localStorage.getItem('gestora') !== '64') {
          this.myFormContribuyente.get('domicilio')?.get('estados')?.enable();
        } else {
          this.myFormContribuyente.get('domicilio')?.get('observaciones')?.disable();
        }
        this.changeEstado('17');
      }
    });

    this.contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente')!);


    /* Si es una persona Moral se deshabilita datos de Persona fisica y habilita RazonSocial */
    /*if(this.contribuyenteArr.data.contribuyente && this.contribuyenteArr.data.contribuyente.tipoPersona === 'M') {
      this.disabledEnabledElement(['nombre','primerApellido','segundoApellido','curp'],['razonSocial']);
      this.tipoPersona = 'M';
    }*/

    /* MODIF: 12/12/2023 */
    if(localStorage.getItem('gestora') !== '64') {
      this.TaxDataControl = false;
    }
  }

  /*
      SE DISPARA AL SELECCIONAR UN ESTADO
      MODIF: 12/12/2023
  */
  changeEstado(event: string): void {
    this.serviciosGenerales.getMunicipios(Number(event))
      .subscribe(resp => {
        if(!resp || resp.data.length==0){
          this.openSnackBar('Problema con el API-SERVER, favor de contactar a Servicio Técnico ');
        } else {
          this.arrMunicipios = resp.data;
        }

      });
  }

  changeTaxData(event:boolean) {
    if(event) {
      this.myFormContribuyente.get('tipoPersona')?.setValue('F');
      this.myFormContribuyente.get('tipoPersona')?.disable();
      this.changeRadioTP('F');
      this.disabledEnabledElement(['razonSocial','rfc','curp','domicilio'],[]);
      this.myFormContribuyente.get('domicilio')?.get('observaciones')?.enable();
      return;
    }
    this.disabledEnabledElement([],['rfc','curp','domicilio']);
    this.myFormContribuyente.get('tipoPersona')?.enable()
    return;
  }

  onKeyPress( stringTag: string ) {
    this.myFormContribuyente.get('nombre')?.setValue(stringTag);
  }

  getMessage(idMssg:number, nameField:string) {
    let touched = this.myFormContribuyente.get('domicilio')?.get(nameField)?.touched;
    let nameFileValue = this.myFormContribuyente.get('domicilio')?.get(nameField)?.value;
    let pathSelect = this.validatosService.streetNamePath;

    if(idMssg !== null) {
      const message = this.mssgArr.filter(({id}) => id == idMssg )
      return message[0].msg;
    }
    if(nameField === 'nombre' || nameField === 'primerApellido' || nameField === 'segundoApellido' || nameField === 'razonSocial') {
      touched = this.myFormContribuyente.get(nameField)?.touched;
      nameFileValue = this.myFormContribuyente.get(nameField)?.value;
      pathSelect = this.validatosService.peoplesNamePath;
    }

    if( touched ) {
      let idMessage=101;

      let pattern = new RegExp(pathSelect);
      if(!pattern.test(nameFileValue) || nameFileValue == null) {
        if (nameFileValue === null) {
          idMessage = 100;
        }
        const message = this.mssgArr.filter(({id}) => id == idMessage );
        this.myFormContribuyente.get('domicilio')?.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );
        if(nameField === 'nombre' || nameField === 'primerApellido' || nameField === 'segundoApellido' || nameField === 'razonSocial')
          this.myFormContribuyente.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );

        return message[0].msg;
      }

    }
    return '';
  }

  disabledEnabledElement(element:string[],enabledElement:string[]) {
    element.forEach(element => {
      this.myFormContribuyente.get(element)?.disable();
    });
    enabledElement.forEach(element => {
      this.myFormContribuyente.get(element)?.enable();
    });
  }

  changeRadioTP(evento:string): void {
    this.tipoPersona = evento;
    if (evento==='M') {
      this.disabledEnabledElement(['nombre','primerApellido','segundoApellido','curp'],['razonSocial']);
      this.myFormContribuyente.get('rfc')?.setValue('');
      this.myFormContribuyente.get('rfc')?.clearValidators();
      this.myFormContribuyente.get('rfc')?.setValidators([Validators.required, Validators.pattern(this.validatosService.rfcMoral)]);
      this.myFormContribuyente.updateValueAndValidity();
      return;
    }
    this.disabledEnabledElement(['razonSocial'], ['nombre','primerApellido','segundoApellido','curp']);
    this.myFormContribuyente.get('razonSocial')?.enable(); //.addValidators([]);
    this.myFormContribuyente.get('rfc')?.clearValidators();
    this.myFormContribuyente.get('rfc')?.setValue('XAXX010101000');
    this.myFormContribuyente.get('rfc')?.setValidators([Validators.required, Validators.pattern(this.validatosService.rfcFisica)]);
    this.myFormContribuyente.updateValueAndValidity();
    return;
  }

  monthDescription(valor:number): string {

        switch (valor) {
            case 1:
                return "Enero";
            case 2:
                return "Febrero";
            case 3:
                return "Marzo";
            case 4:
                return "Abril";
            case 5:
                return "Mayo";
            case 6:
                return "Junio";
            case 7:
                return "Julio";
            case 8:
                return "Agosto";
            case 9:
                return "Septiembre";
            case 10:
                return "Octubre";
            case 11:
                return "Noviembre";
            case 12:
                return "Diciembre";
            default:
                return "Error";
        }

}

  generarPoliza(): void {

    if (this.myFormContribuyente.invalid) {
      this.myFormContribuyente.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }
    const datos:ReintegrosStruct = JSON.parse(localStorage.getItem('datos_cobro')!);
    const gestora = localStorage.getItem('gestora')!;
    if (!this.contribuyenteArr.data.contribuyente) {
      this.contribuyenteArr.data.contribuyente = {
        nombre:          '',
        tipoPersona:     '',
        razonSocial:     '',
        primerApellido:  '',
        segundoApellido: '',
        rfc:             '',
        curp:            '',
        id:              0,
      };
      this.contribuyenteArr.data.contribuyente.nombre = String( this.myFormContribuyente.get('nombre')?.value ).toUpperCase();
      this.contribuyenteArr.data.contribuyente.primerApellido = String(this.myFormContribuyente.get('primerApellido')?.value).toUpperCase();
      this.contribuyenteArr.data.contribuyente.segundoApellido = String(this.myFormContribuyente.get('segundoApellido')?.value).toUpperCase();
      localStorage.setItem('contribuyente_only',JSON.stringify(this.contribuyenteArr));
    }

    this.isLoading = true;
    this.buttBlock = true;
    let vehicle_data = {} as VehicleData;
    let datosAdicionales: string = '';
    let datosAdicionales_adic: string = '';
    let servicio = '';
    let tipoSer = [];
    let observaciones = (this.myFormContribuyente.get('domicilio')?.get('observaciones')?.value)?String(this.myFormContribuyente.get('domicilio')?.get('observaciones')?.value).toUpperCase():"";
    const dataVehicle_adit = JSON.parse(localStorage.getItem('vehicle_data_adicional')!);
    let route_origen:string = localStorage.getItem('route_origen')?.replaceAll('-','').toUpperCase()!;

    Object.entries(TipoServicio).forEach((v,k) => {
      tipoSer = v.toString().split(',');
      if (tipoSer[0]==route_origen.split('/').find((v,k) => k == 1 )){
        servicio = tipoSer[1];//',' + tipoSer[1];
      }
    });

    const concept = (localStorage.getItem('concept'))?localStorage.getItem('concept')?.toString():'';
    if (localStorage.getItem('vehicle_data')) {
      vehicle_data = JSON.parse(localStorage.getItem('vehicle_data')!);
      let fecha_factura = '';
      let fecha_factura_array: Array<any> = [];

      if(vehicle_data.fechaFactura) {
        fecha_factura_array = String(vehicle_data.fechaFactura).split('/')
        fecha_factura = String(fecha_factura_array[2]) + '-' + String(fecha_factura_array[1]).padStart(2,'0') + '-' + String(fecha_factura_array[0]).padStart(2,'0');
      }

      datosAdicionales_adic = datosAdicionales = `PLACA: ${vehicle_data.placa.toUpperCase()},PLACA ANTERIOR: ${(vehicle_data.placaAnterior)?vehicle_data.placaAnterior.toUpperCase():(dataVehicle_adit && dataVehicle_adit.placaAnterior)?dataVehicle_adit.placaAnterior:''},,,,,MODELO: ${(vehicle_data.modelo)?vehicle_data.modelo.toString():''},,,,MOTOR: ,FECHA FACTURA: ${fecha_factura},VALOR FACTURA: ${(vehicle_data.valorFactura)?vehicle_data.valorFactura.toString():''},PROCEDENCIA: ${(dataVehicle_adit && dataVehicle_adit.procedencia)?dataVehicle_adit.procedencia:''},,NO DE SERIE: ${vehicle_data.numeroSerie},VALOR VENTA: ,SERVICIO:` + ((servicio == 'T: 01' || servicio == 'T: 13')?' PARTICULAR':' ');// +
        if(servicio == 'T: 13' && vehicle_data.pagoBaja == 2) {
          datosAdicionales_adic += ",T: 10";
        } else {
          datosAdicionales_adic += `,${servicio}`;
        }
        datosAdicionales_adic += ((servicio == 'T: 13' || servicio == 'T: 01')?',TRAMITE: ALTA':'');
    }

    if((servicio == 'T: 08' || servicio == 'T: 01' || servicio == 'T: 13' || servicio == 'T: 03' || servicio == 'T: 05' || servicio == 'T: 02') && (gestora=='64')) {
      datosAdicionales = datosAdicionales_adic + ((observaciones!=='')?'| OBSERVACIONES: ':'') + observaciones;
      observaciones = datosAdicionales_adic + '.' + ((observaciones!=='')?' OBSERVACIONES: ':'') + observaciones;
    }
    if ( servicio.length == 0  && (gestora=='22' || gestora=='9' || gestora=='53' || gestora=='75' || gestora=='30' || gestora=='68' || gestora=='14' || gestora=='73')) {
      datosAdicionales = ((observaciones!=='')?'OBSERVACIONES: ':'') + observaciones;
      observaciones = ((observaciones!=='')?'OBSERVACIONES: ':'') + observaciones;

      if(gestora=='22' && (dataVehicle_adit && dataVehicle_adit.licencia)) {
        let fecha_vencimiento = '';
        let fecha_vencimiento_array: Array<any> = [];
        fecha_vencimiento_array = String(dataVehicle_adit.fecha_vencimiento).split('/')
        fecha_vencimiento = String(fecha_vencimiento_array[2]) + '-' + String(fecha_vencimiento_array[1]).padStart(2,'0') + '-' + String(fecha_vencimiento_array[0]).padStart(2,'0');

        observaciones = ((observaciones!=='')?'':'OBSERVACIONES: ') + `${observaciones} No. Licencia: ${String(dataVehicle_adit.licencia).toUpperCase()} ,Fecha vencimiento: ${fecha_vencimiento},.`
        datosAdicionales = observaciones;
      }
    }



   if(datos) {
    if(datos.tipo_form && (datos.tipo_form==17 || datos.tipo_form==16 || datos.tipo_form==14)) {
      if(datos.tipo_form==17) {
        observaciones += `,${datos.fecha_retencion},${datos.ejercicio_fiscal},${datos.nombre_fondo},${datos.numero_contrato},${datos.objeto_contrato},${datos.fuente_financiamiento},${datos.monto_ejercido},${datos.monto_retenido},${datos.numero_oficio},${datos.numero_factura}`;
      }
      datosAdicionales += `ContribuyenteReintegro: ${datos.nombre},${datos.telefono},${datos.email}`;
    } else {
      this.dataPoliza.fechaVencimiento = datos.fechaVencimiento;
      if(datos.tipo_form && datos.tipo_form==3) {
        datosAdicionales = `OBSERVACIONES: Fecha próxima de verificación: ${observaciones} ` + datos.fecha_verificacion + ', Placa: ' + datos.placa + ', Serie: ' + datos.serie;
      }
      /* DESARROLLO SUSTENTABLE - CALIDAD DEL AIRE CERTIFICACION VERIFICACION */
      if(datos.tipo_form && datos.tipo_form==12) {
        datosAdicionales = `Numero de Folio:${datos.folio},Año:${datos.anio},Tipo:${datos.certificacion},Semestre:${datos.semestre} `;
        if (observaciones!=='')
          datosAdicionales += `OBSERVACIONES: ${observaciones} `;
      }
      /* DESARROLLO SUSTENTABLE - DATOS POR EL INCUMPLIMIENTO DE VERIFICACION */
      if(datos.tipo_form && datos.tipo_form==3) {
        if (observaciones!=='') {
          datosAdicionales = `OBSERVACIONES: ${observaciones} `;
        }
        if(datos.fecha_verificacion) {
          datosAdicionales += `Fecha proxima verificacion: ${datos.fecha_verificacion},`
        }
        datosAdicionales += ` Placa: ${datos.placa}, Serie: ${datos.serie}`;
      }
      /* HACIENDA - IMPUESTOS - ISAN */
      if(datos.tipo_form && datos.tipo_form==4) {
        datosAdicionales = `${datos.concepto!}-${this.monthDescription(Number(datos.periodo))}-${datos.ejercicio}`;
        observaciones = datosAdicionales += (observaciones!=='')? ` OBSERVACIONES: ${observaciones}`:'';
      }
    }
   }

   let estado: string = '';
   let municipio: string = '';
   let estadoPeticion: boolean = false;
   this.serviciosGenerales.getEntidadesFederativas(this.myFormContribuyente.get('domicilio')?.get('estados')?.value)
    .subscribe({
      next: value=> {
        if(value!.data.length>0) {
          estado=value!.data[0].descripcion;
        }
      },
      complete: () => {
        //estadoPeticion = true
        if(this.myFormContribuyente.get('domicilio')?.get('municipio')?.value !== '' && this.myFormContribuyente.get('domicilio')?.get('municipio')?.value >0) {
          this.serviciosGenerales.getMunicipios(this.myFormContribuyente.get('domicilio')?.get('estados')?.value,this.myFormContribuyente.get('domicilio')?.get('municipio')?.value)
            .subscribe({
              next: (value) => {
                if(value!.data.length>0) {
                  municipio=value!.data[0].descripcion;
                }
              },
              complete: () => estadoPeticion = true
            });
        } else {
          municipio = 'CUERNAVACA';
          estadoPeticion = true;
        }
      }
    });

    let id = setInterval(() => {
      if(estadoPeticion) {
        let razonSocial:string = this.myFormContribuyente.get('razonSocial')?.value;

        const movimiento = localStorage.getItem('movimiento')!;

        //observaciones += (this.myFormContribuyente.get('domicilio')?.get('observaciones')?.value)?' OBSERVACIONES: ' + String(this.myFormContribuyente.get('domicilio')?.get('observaciones')?.value).toUpperCase():'';

        this.dataPoliza.sistema = gestora;
        this.dataPoliza.movimiento = movimiento;//this.movimiento.toString();
        this.dataPoliza.total = this.contribuyenteArr.data.total;
        this.dataPoliza.rfc = (this.myFormContribuyente.get('rfc')?.value)?this.myFormContribuyente.get('rfc')?.value:'XAXX010101000';
        this.dataPoliza.nombre = ((razonSocial.length>0)?this.myFormContribuyente.get('razonSocial')?.value:String(this.myFormContribuyente.get('nombre')?.value).toUpperCase());
        this.dataPoliza.primerApellido = String(this.myFormContribuyente.get('primerApellido')?.value).toUpperCase();
        this.dataPoliza.segundoApellido = String(this.myFormContribuyente.get('segundoApellido')?.value).toUpperCase();
        this.dataPoliza.razonSocial = String(this.myFormContribuyente.get('razonSocial')?.value).toUpperCase();
        this.dataPoliza.tipoPersona = this.myFormContribuyente.get('tipoPersona')?.value;
        this.dataPoliza.origen = 'VU';
        this.dataPoliza.calle = (this.myFormContribuyente.get('domicilio')?.get('calle')?.value)?String(this.myFormContribuyente.get('domicilio')?.get('calle')?.value).toUpperCase():'.';
        this.dataPoliza.numeroExterior = (this.myFormContribuyente.get('domicilio')?.get('numeroExterior')?.value)?this.myFormContribuyente.get('domicilio')?.get('numeroExterior')?.value:0;
        this.dataPoliza.numeroInterior = this.myFormContribuyente.get('domicilio')?.get('numeroInterior')?.value;
        this.dataPoliza.colonia = (this.myFormContribuyente.get('domicilio')?.get('colonia')?.value)?String(this.myFormContribuyente.get('domicilio')?.get('colonia')?.value).toUpperCase():".";
        this.dataPoliza.municipio = (municipio !== '')?municipio:'CUERNAVACA';
        this.dataPoliza.estado = (estado)?estado:'MORELOS';
        this.dataPoliza.codigoPostal = (this.myFormContribuyente.get('domicilio')?.get('codigoPostal')?.value)?this.myFormContribuyente.get('domicilio')?.get('codigoPostal')?.value:62000;
        this.dataPoliza.observaciones = (gestora=='64' || gestora=='40')?observaciones:((observaciones!=='')?(observaciones.includes('OBSERVACIONES:'))?observaciones:`OBSERVACIONES: ${observaciones}`:''); //observaciones;//
        this.dataPoliza.datosAdicionales = datosAdicionales;
        this.dataPoliza.detalle = this.contribuyenteArr.data.lineaDetalle;

          this.smytService.generarPolizaServ(this.dataPoliza)
            .subscribe(resp => {
              this.isLoading = false;
              this.buttBlock = false;
              if ( resp.success) {
                localStorage.setItem('datos_poliza',JSON.stringify(resp.poliza));
                this.router.navigate(['pagos/generar_poliza']);
                return;
              }
              this.openSnackBar(resp.data!);
              return;
          });
          clearInterval(id);
      }
      //console.log('continua la la espera')
    },150)
  }

  isValidField(field: string) {

  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 4000,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }


}
