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

  public contribuyenteArr: TopLevel = {
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
  };
  public contribDom: Object[] = [];

  public messages: Messages[] = [];
  public messages_other: Messages[] = [];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  public dataPoliza: DatosPoliza = {
    sistema: '',
    movimiento: '',
    total: 0,
    rfc: '',
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    razonSocial: '',
    tipoPersona: '',
    origen: '',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    municipio: '',
    estado: '',
    codigoPostal: '',
    observaciones: '',
    datosAdicionales: '',
    detalle: '',
};

  // estos informacion se enviara desde el modulo de SMYT
  private sistema: number = 46;
  private movimiento: number = 100

  public myFormContribuyente: FormGroup = this.fb.group({
    tipoPersona: ['',[Validators.required]],
    nombre: ['',[Validators.required]],
    primerApellido: ['', [Validators.required]],
    segundoApellido: ['', [Validators.required]],
    razonSocial: [{value: '', disabled: true},[Validators.required]],
    rfc: [],
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
    console.log('Log_1')
    if (this.myFormContribuyente.invalid) {
      this.myFormContribuyente.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }
    console.log('Log_2')
    this.isLoading = true;
    this.buttBlock = true;

    const dataVehicleLs = JSON.parse(localStorage.getItem('vehicle_data')!);
    const datosAdicionales = `PLACA: ${dataVehicleLs.placa},PLACA ANTERIOR: -,,,,,MODELO: ,,,,MOTOR: ,FECHA FACTURA: ,VALOR FACTURA: ,PROCEDENCIA:,,NO DE SERIE: ${dataVehicleLs.serie},VALOR VENTA: ,SERVICIO: ,T: 08.`;

   this.dataPoliza.sistema = this.sistema.toString();
   this.dataPoliza.movimiento = this.movimiento.toString();
   this.dataPoliza.total = this.contribuyenteArr.data.total;
   this.dataPoliza.rfc = this.contribuyenteArr.data.contribuyente.rfc;
   this.dataPoliza.nombre = this.contribuyenteArr.data.contribuyente.nombre;
   this.dataPoliza.primerApellido = this.contribuyenteArr.data.contribuyente.primerApellido;
   this.dataPoliza.segundoApellido = this.contribuyenteArr.data.contribuyente.segundoApellido;
   this.dataPoliza.razonSocial = this.contribuyenteArr.data.contribuyente.razonSocial;
   this.dataPoliza.tipoPersona = this.contribuyenteArr.data.contribuyente.tipoPersona;
   this.dataPoliza.origen = 'VU';//this.contribuyenteArr.data.domicilio.origen;
   this.dataPoliza.calle = this.contribuyenteArr.data.domicilio.calle;
   this.dataPoliza.numeroExterior = this.contribuyenteArr.data.domicilio.numeroExterior;
   this.dataPoliza.numeroInterior = this.contribuyenteArr.data.domicilio.numeroInterior;
   this.dataPoliza.colonia = this.contribuyenteArr.data.domicilio.colonia;
   this.dataPoliza.municipio = this.contribuyenteArr.data.domicilio.municipio;
   this.dataPoliza.estado = this.contribuyenteArr.data.domicilio.estado;
   this.dataPoliza.codigoPostal = this.contribuyenteArr.data.domicilio.codigoPostal;
   this.dataPoliza.observaciones = (this.myFormContribuyente.get('observaciones')?.value)?this.myFormContribuyente.get('observaciones')?.value:"";
   this.dataPoliza.datosAdicionales = datosAdicionales;
   this.dataPoliza.detalle = this.contribuyenteArr.data.lineaDetalle;

    console.log(this.dataPoliza)


    /*this.smytService.generarPolizaServ(this.dataPoliza)
      .subscribe(resp => {
        if ( resp.success) {
          this.isLoading = false;
          localStorage.setItem('datos_poliza',JSON.stringify(resp.poliza));
          this.router.navigate(['pagos/generar_poliza']);
        }
      });*/
  }

  isValidField(field: string) {

  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 3500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }

  /*
  {
    "sistema": "46",
    "movimiento": "100",
    "total": 6218,
    "rfc": "FIGL660118000",
    "nombre": "LEOBARDO",
    "primerApellido": "FIGUEROA",
    "segundoApellido": "GOMEZ",
    "razonSocial": null,
    "tipoPersona": "F",
    "origen": "VU",
    "calle": "TLACOPAN",
    "numeroExterior": "27",
    "numeroInterior": "",
    "colonia": "OCOTEPEC",
    "municipio": "CUERNAVACA",
    "estado": "MORELOS",
    "codigoPostal": "62220",
    "datosAdicionales": "1060042¬0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2023¬778.00¬|1060020¬1100¬1¬RECARGOS REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2023¬62.00¬1060042|1060057¬0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2023¬9.00¬1060042|1060081¬0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2022¬722.00¬|1060003¬1100¬1¬RECARGOS REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2022¬147.00¬1060081|1060052¬0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2022¬56.00¬1060081|1060062¬0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2021¬672.00¬|1060017¬1100¬1¬RECARGOS REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2021¬235.00¬1060062|1060050¬0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2021¬113.00¬1060062|1060013¬0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2020¬565.00¬|1060104¬1100¬1¬RECARGOS REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2020¬217.00¬1060013|1060063¬0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2020¬107.00¬1060013|1060164¬1280¬1¬CANJE DE PLACAS SERVICIO PARTICULAR: AUTO PARTICULAR¬2019¬845.00¬|1060143¬1100¬1¬RECARGOS CANJE DE PLACAS SERVICIO PARTICULAR: AUTO PARTICULAR¬2019¬449.00¬1060164|1060102¬0661¬1¬ACTUALIZACION CANJE DE PLACAS SERVICIO PARTICULAR: AUTO PARTICULAR¬2019¬202.00¬1060164|1060172¬0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2018¬524.00¬|1060133¬1100¬1¬RECARGOS REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2018¬355.00¬1060172|1060138¬0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2018¬160.00¬1060172|",
    "detalle": "1060042¬0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2023¬778.00¬|1060020¬1100¬1¬RECARGOS REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2023¬62.00¬1060042|1060057¬0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2023¬9.00¬1060042|1060081¬0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2022¬722.00¬|1060003¬1100¬1¬RECARGOS REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2022¬147.00¬1060081|1060052¬0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2022¬56.00¬1060081|1060062¬0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2021¬672.00¬|1060017¬1100¬1¬RECARGOS REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2021¬235.00¬1060062|1060050¬0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2021¬113.00¬1060062|1060013¬0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2020¬565.00¬|1060104¬1100¬1¬RECARGOS REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2020¬217.00¬1060013|1060063¬0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2020¬107.00¬1060013|1060164¬1280¬1¬CANJE DE PLACAS SERVICIO PARTICULAR: AUTO PARTICULAR¬2019¬845.00¬|1060143¬1100¬1¬RECARGOS CANJE DE PLACAS SERVICIO PARTICULAR: AUTO PARTICULAR¬2019¬449.00¬1060164|1060102¬0661¬1¬ACTUALIZACION CANJE DE PLACAS SERVICIO PARTICULAR: AUTO PARTICULAR¬2019¬202.00¬1060164|1060172¬0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2018¬524.00¬|1060133¬1100¬1¬RECARGOS REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2018¬355.00¬1060172|1060138¬0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬2018¬160.00¬1060172|"




        return `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><CargaFiltros xmlns="http://tempuri.org/"><hash_code>${this.code}</hash_code></CargaFiltros></s:Body></s:Envelope>`;

}
  */
}
