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

@Component({
  selector: 'shared-datos-contribuyente',
  templateUrl: './datos-contribuyente.component.html',
  styleUrls: ['./datos-contribuyente.component.css']
})
export class DatosContribuyenteComponent implements OnInit {

  public mssgArr: MessageSmyt[] = ListMessageSmyt.smyt;
  public arrMunicipios: Municipios[] = ListaMunicipios;
  private cadenaError: string = '';
  public tipoPersona: string = 'F';

  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  public contribuyenteArr = {} as TopLevel;/*: TopLevel = {
    data:    {
      total:         0,
      conceptos:     [],
      contribuyente: {
        nombre:          '',
        tipoPersona:     '',
        razonSocial:     '',
        primerApellido:  '',
        segundoApellido: '',
        rfc:             '',
        curp:            '',
        id:              0,
      },
      domicilio:     {
        calle:          '',
        numeroExterior: '',
        numeroInterior: '',
        colonia:        '',
        municipio:      '',
        estado:         '',
        origen:         '',
        codigoPostal:   '',
        tipoDomicilio:  '',
        referencia:     '',
        id:             0
      },
      lineaDetalle:  '',
    },
    success: false,
  };*/
  public contribDom: Object[] = [];

  public messages: Messages[] = [];
  public messages_other: Messages[] = [];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  public dataPoliza = {} as DatosPoliza;

  // estos informacion se enviara desde el modulo de SMYT
  private sistema: number = 64;//46;
  private movimiento: number = 100

  public myFormContribuyente: FormGroup = this.fb.group({
    tipoPersona: ['',[Validators.required]],
    nombre: ['',[Validators.required]],
    primerApellido: ['', [Validators.required]],
    segundoApellido: ['', [Validators.required]],
    razonSocial: [{value: '', disabled: true},[Validators.required]],
    rfc: ['', [Validators.required, Validators.pattern(this.validatosService.rfcPath)]],
    curp: [],
    domicilio: this.fb.group({
      calle: ['', [Validators.required]],
      numeroExterior: ['', [Validators.required]],
      numeroInterior: [],
      colonia: ['', [Validators.required]],
      codigoPostal: ['', [Validators.required]],
      municipio: [],
      observaciones: []
    },
    {
      validators:[this.validatosService.validateDataInput('calle',4,'domicilio'),
        this.validatosService.validateDataInput('numeroExterior',5,'domicilio'),
        this.validatosService.validateDataInput('colonia',6,'domicilio'),
        this.validatosService.validateDataInput('codigoPostal',7,'domicilio'),
      ]
    }
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
    private validatosService: ValidatorsService
  ) { }

  @HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  ngOnInit(): void {
    if(!localStorage.getItem('contribuyente')) {
      this.openSnackBar('No se cuenta con información para continuar con el proceso')
      setTimeout(()=>{
        this.router.navigate(['pagos']);
      },2500)

    }
    this.contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente')!);
    if (this.contribuyenteArr.data.contribuyente) {
      this.myFormContribuyente.get('tipoPersona')?.disable();
    }

    this.myFormContribuyente.reset(this.contribuyenteArr.data.contribuyente);
    this.myFormContribuyente.get('domicilio')?.reset(this.contribuyenteArr.data.domicilio);

    if (this.contribuyenteArr.data.contribuyente === undefined) {
      this.myFormContribuyente.reset({tipoPersona:'F'})
    }

    /* Si es una persona Moral se deshabilita datos de Persona fisica y habilita RazonSocial */
    if(this.contribuyenteArr.data.contribuyente.tipoPersona === 'M') {
      this.disabledEnabledElement(['nombre','primerApellido','segundoApellido'],['razonSocial']);
      this.tipoPersona = 'M';
    }
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

      let pattern = new RegExp(pathSelect);//'^[a-zA-ZÑÁÉÍÓÚ.]+([\ a-zA-ZÑÁÉÍÓÚ]+)*');//'^[A-ZÑÁÉÍÓÚ. ]+$')
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
    if (evento==='M') {
      this.disabledEnabledElement(['nombre','primerApellido','segundoApellido'],['razonSocial']);
    }
    this.disabledEnabledElement(['razonSocial'], ['nombre','primerApellido','segundoApellido']);
    this.tipoPersona = evento;
    this.myFormContribuyente.get('razonSocial')?.enable(); //.addValidators([]);
  }

  generarPoliza(): void {

    if (this.myFormContribuyente.invalid) {
      this.myFormContribuyente.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }
    const datos = JSON.parse(localStorage.getItem('datos_cobro')!);
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
      console.log(tipoSer[0] + '==' + route_origen.split('/').find((v,k) => k == 1 ))
      if (tipoSer[0]==route_origen.split('/').find((v,k) => k == 1 )){
        servicio = tipoSer[1];//',' + tipoSer[1];
      }
    });

    const concept = (localStorage.getItem('concept'))?localStorage.getItem('concept')?.toString():'';
    if (localStorage.getItem('vehicle_data')) {
      vehicle_data = JSON.parse(localStorage.getItem('vehicle_data')!);
      datosAdicionales_adic = datosAdicionales = `PLACA: ${vehicle_data.placa},PLACA ANTERIOR: ${(vehicle_data.placaAnterior)?vehicle_data.placaAnterior:''},,,,,
        MODELO: ${(vehicle_data.modelo)?vehicle_data.modelo.toString():''},,,,MOTOR: ,FECHA FACTURA: ${(vehicle_data.fechaFactura)?vehicle_data.fechaFactura:''},
        VALOR FACTURA: ${(vehicle_data.valorFactura)?vehicle_data.valorFactura.toString():''},PROCEDENCIA: ${(dataVehicle_adit)?dataVehicle_adit.procedencia:''},,
        NO DE SERIE: ${vehicle_data.numeroSerie},VALOR VENTA: ,SERVICIO:` + ((servicio == 'T: 01' || servicio == 'T: 13')?' PARTICULAR':' ') +
        `,${servicio}` + ((servicio == 'T: 13')?',TRAMITE: ALTA':'');
    }

    if(servicio == 'T: 08' || servicio == 'T: 01' || servicio == 'T: 13') {
      datosAdicionales = datosAdicionales_adic + '|' +  ((observaciones!=='')?' OBSERVACIONES: ':'') + observaciones;
      observaciones = datosAdicionales_adic + '.' + ((observaciones!=='')?' OBSERVACIONES: ':'') + observaciones;
    }



   if(datos) {
    this.dataPoliza.fechaVencimiento = datos.fechaVencimiento;
    if(datos.sistema) {
      this.sistema = datos.sistema;
    }

   }
   this.dataPoliza.sistema = this.sistema.toString();
   this.dataPoliza.movimiento = this.movimiento.toString();
   this.dataPoliza.total = this.contribuyenteArr.data.total;
   this.dataPoliza.rfc = this.myFormContribuyente.get('rfc')?.value;
   this.dataPoliza.nombre = String(this.myFormContribuyente.get('nombre')?.value).toUpperCase();
   this.dataPoliza.primerApellido = String(this.myFormContribuyente.get('primerApellido')?.value).toUpperCase();
   this.dataPoliza.segundoApellido = String(this.myFormContribuyente.get('segundoApellido')?.value).toUpperCase();
   this.dataPoliza.razonSocial = this.myFormContribuyente.get('razonSocial')?.value;
   this.dataPoliza.tipoPersona = this.myFormContribuyente.get('tipoPersona')?.value;
   this.dataPoliza.origen = 'VU';
   this.dataPoliza.calle = String(this.myFormContribuyente.get('domicilio')?.get('calle')?.value).toUpperCase();
   this.dataPoliza.numeroExterior = this.myFormContribuyente.get('domicilio')?.get('numeroExterior')?.value;
   this.dataPoliza.numeroInterior = this.myFormContribuyente.get('domicilio')?.get('numeroInterior')?.value;
   this.dataPoliza.colonia = String(this.myFormContribuyente.get('domicilio')?.get('colonia')?.value).toUpperCase();
   this.dataPoliza.municipio = this.myFormContribuyente.get('domicilio')?.get('municipio')?.value;
   this.dataPoliza.estado = 'MORELOS'
   this.dataPoliza.codigoPostal = this.myFormContribuyente.get('domicilio')?.get('codigoPostal')?.value;
   this.dataPoliza.observaciones = observaciones;
   this.dataPoliza.datosAdicionales = datosAdicionales;
   this.dataPoliza.detalle = this.contribuyenteArr.data.lineaDetalle;
   console.log(this.dataPoliza);
    /*this.smytService.generarPolizaServ(this.dataPoliza)
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
    });*/
  }

  isValidField(field: string) {

  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 3500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }


}
