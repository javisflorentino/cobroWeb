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
import { filter } from 'rxjs';

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
    console.log(TipoServicio.SMYTALTAVEHICULONUEVO)
    this.isLoading = true;
    this.buttBlock = true;
    const concept = (localStorage.getItem('concept'))?localStorage.getItem('concept')?.toString():'';
    let vehicle_data: VehicleData = JSON.parse(localStorage.getItem('vehicle_data')!);
    let route_origen:string = localStorage.getItem('route_origen')?.replace('-','').toUpperCase()!;
    let tipoSer;

    /*for(const key of Object.keys(TipoServicio)) {
      if(key == route_origen)
        tipoOrigen = TipoServicio[key]
    }*/
    /*Object.entries(TipoServicio).forEach((k,v) => {
      if(k === route_origen)
        tipoSer = v;
    })*/

    const dataVehicleLs = JSON.parse(localStorage.getItem('vehicle_data')!);
    const datosAdicionales = `PLACA: ${dataVehicleLs.placa},PLACA ANTERIOR: -,,,,,MODELO: ,,,,MOTOR: ,FECHA FACTURA: ,VALOR FACTURA: ,PROCEDENCIA:,,NO DE SERIE: ${dataVehicleLs.serie},VALOR VENTA: ,SERVICIO: ,T: 08.`;

    this.dataPoliza.opc = '8';
    this.dataPoliza.sistema = this.sistema.toString();
    this.dataPoliza.nombrePoliza = concept!;
    this.dataPoliza.fechaVencimiento = '00';
    this.dataPoliza.montoTotal = this.contribuyenteArr.data.total.toString();
    this.dataPoliza.observaciones = this.myFormContribuyente.get('domicilio')?.get('observaciones')?.value;
    this.dataPoliza.datosAdicionales = '';
    // Checar esta linea, posiblemente en algunos casos se tendrá que construir
    this.dataPoliza.lineaDetalle = this.contribuyenteArr.data.lineaDetalle;
    this.dataPoliza.rfc = this.myFormContribuyente.get('rfc')?.value;
    this.dataPoliza.nombre = this.myFormContribuyente.get('nombre')?.value;
    this.dataPoliza.paterno = this.myFormContribuyente.get('primerApellido')?.value;
    this.dataPoliza.materno = this.myFormContribuyente.get('segundoApellido')?.value;
    this.dataPoliza.razonSocial = this.myFormContribuyente.get('razonSocial')?.value;
    this.dataPoliza.calle = this.myFormContribuyente.get('domicilio')?.get('calle')?.value;
    this.dataPoliza.numeroExt = this.myFormContribuyente.get('domicilio')?.get('numeroExterior')?.value;
    this.dataPoliza.numeroInt = this.myFormContribuyente.get('domicilio')?.get('numeroInterior')?.value;
    this.dataPoliza.colonia = this.myFormContribuyente.get('domicilio')?.get('colonia')?.value;
    this.dataPoliza.codigoPostal = this.myFormContribuyente.get('domicilio')?.get('codigoPostal')?.value;
    // Dato Fijo
    this.dataPoliza.estados = '17|MORELOS';
    this.dataPoliza.municipios = this.myFormContribuyente.get('domicilio')?.get('municipio')?.value;
    this.dataPoliza.tipoDomicilio1 = '';
    // La referencia cambia, hasta el momento ceo 3 y 2
    this.dataPoliza.referencia1 = '3';
    this.dataPoliza.ip = '';
    this.dataPoliza.explorador = 'PAGINA';
    this.dataPoliza.isp = '';
    this.dataPoliza.paginaAnterior = '';
    this.dataPoliza.lineaCaptura = '';
    this.dataPoliza.numeroPoliza = '';
    this.dataPoliza.lineaOxxo = '';
    this.dataPoliza.fechaGeneracion = '';
    this.dataPoliza.curp = this.myFormContribuyente.get('curp')?.value;
    this.dataPoliza.fechaNacimiento = '';
    this.dataPoliza.idVehiculo = this.myFormContribuyente.get('domicilio')?.get('municipio')?.value;
    this.dataPoliza.noSeriev = vehicle_data.numeroSerie;
    this.dataPoliza.placav = vehicle_data.placa;
    // valor Opcional solo en vehiculos_usados
    this.dataPoliza.placaAnterior = vehicle_data.placaAnterior!;
    // solo se usa en vehiculos usados
    this.dataPoliza.noCilindros = this.myFormContribuyente.get('cilindros')?.value;
    // solo se usa en vehiculos usados
    this.dataPoliza.centimetrosCubicos = this.myFormContribuyente.get('centimetros')?.value;
    // solo se usa en vehiculos usados
    this.dataPoliza.modelo = this.myFormContribuyente.get('modelo')?.value;
    // solo se usa en vehiculos usados
    this.dataPoliza.valorFactura = this.myFormContribuyente.get('valor_factura')?.value;
    // ningun tipo de vehiculo lo tiene habilitado
    this.dataPoliza.valorVenta = '';
    // ningun tipo de vehiculo lo tiene habilitado
    this.dataPoliza.tonelaje = '';
    // ningun tipo de vehiculo lo tiene habilitado
    this.dataPoliza.combustible = '';
    // solo se usa en vehiculos usados
    this.dataPoliza.procedencia = this.myFormContribuyente.get('procedencia')?.value;
    //,T: 08 | PARTICULAR,T: 01,TRAMITE: ALTA | PARTICULAR,T: 10,TRAMITE: ALTA | ,T: 03 | T: 05
    this.dataPoliza.servicio =
    // solo se usa en vehiculos usados
    this.dataPoliza.capacidadPasajeros = this.myFormContribuyente.get('pasajeros')?.value;
    // ningun tipo de vehiculo lo tiene habilitado
    this.dataPoliza.clase = '';
    // ningun tipo de vehiculo lo tiene habilitado
    this.dataPoliza.versionLineaId = '';
    // ningun tipo de vehiculo lo tiene habilitado
    this.dataPoliza.versionLineaCvMarca = '';
    // ningun tipo de vehiculo lo tiene habilitado
    this.dataPoliza.versionCvVersion = '';
    // ningun tipo de vehiculo lo tiene habilitado
    this.dataPoliza.estadoVehiculo = '';
    // ningun tipo de vehiculo lo tiene habilitado
    this.dataPoliza.tipoPlacaId = '';
    // ningun tipo de vehiculo lo tiene habilitado
    this.dataPoliza.motor = '';
    this.dataPoliza.fechaFactura = ''
    // Checar este valor
    this.dataPoliza.tipoMovimiento = '100';


    /*this.dataPoliza.sistema = this.sistema.toString();
   this.dataPoliza.movimiento = this.movimiento.toString();
   this.dataPoliza.total = this.contribuyenteArr.data.total;
   this.dataPoliza.rfc = this.contribuyenteArr.data.contribuyente.rfc;
   this.dataPoliza.nombre = this.contribuyenteArr.data.contribuyente.nombre;
   this.dataPoliza.primerApellido = this.contribuyenteArr.data.contribuyente.primerApellido;
   this.dataPoliza.segundoApellido = this.contribuyenteArr.data.contribuyente.segundoApellido;
   this.dataPoliza.razonSocial = this.contribuyenteArr.data.contribuyente.razonSocial;
   this.dataPoliza.tipoPersona = this.contribuyenteArr.data.contribuyente.tipoPersona;
   this.dataPoliza.origen = 'VU';
   this.dataPoliza.calle = this.contribuyenteArr.data.domicilio.calle;
   this.dataPoliza.numeroExterior = this.contribuyenteArr.data.domicilio.numeroExterior;
   this.dataPoliza.numeroInterior = this.contribuyenteArr.data.domicilio.numeroInterior;
   this.dataPoliza.colonia = this.contribuyenteArr.data.domicilio.colonia;
   this.dataPoliza.municipio = this.contribuyenteArr.data.domicilio.municipio;
   this.dataPoliza.estado = this.contribuyenteArr.data.domicilio.estado;
   this.dataPoliza.codigoPostal = this.contribuyenteArr.data.domicilio.codigoPostal;
   this.dataPoliza.observaciones = (this.myFormContribuyente.get('observaciones')?.value)?this.myFormContribuyente.get('observaciones')?.value:"";
   this.dataPoliza.datosAdicionales = datosAdicionales;
   this.dataPoliza.detalle = this.contribuyenteArr.data.lineaDetalle;*/

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


}



/*
banco: Bancomer
extra: ECONOMIA-


https://app.hacienda.morelos.gob.mx/recibo/poliza/imprimirPoliza?lineaCaptura=93001241432540381253
GET
lineaCaptura=93001241432540381253



smytmacrocuerna@morelos.gob.mx


this.contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente')!);

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



public myForm: FormGroup = this.fb.group({
    modelo:       [ '',[ Validators.required, Validators.max(this.anio + 1), Validators.min(AnioMin.ANIOMIN_VEHICLE) ] ], // Entre 1900 - 2024
    procedencia:  [ 'NACIONAL', [Validators.required]], // Nacional, Extranjero
    uso_vehiculo: [ '' ], // se infiere que es particular
    cilindros:    [ '', [ Validators.required, Validators.max(16), Validators.pattern(this.validatorService.numberPattern)] ],
    centimetros:  [ {value: '', disabled: true}, [Validators.required, Validators.pattern(this.validatorService.numberPattern)]],
    pasajeros:    [ '', [ Validators.required] ],
    valor_factura:[ '', [ Validators.required, Validators.pattern(this.validatorService.numberPattern)]],
    placa_foranea:[ '', [ Validators.required] ],
    pago_baja_f:  [ '1', [Validators.required] ],
    pagos:        this.fb.array(this.aniosPago.map(x => false))
  });










  REFRENDO
SOAP_1
opc: 49
placa: ABC123D
serie: PRUEBA10MARZ4
nombre: PRUEBA
apellido1: PRUEBA
apellido2: PRUEBA
razonSocial:

SOAP_2
opc: 8
-sistema: 64
nombrePoliza: REFRENDO
fechaVencimiento: 00
montoTotal: 857
observaciones:
datosAdicionales:
lineaDetalle: 0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬778.0000¬2023¬¬857¬|0220¬1¬15% APOYO A LA EDUCACION¬0.0000¬2023¬0280¬¬|0240¬1¬5% PRO-INDUSTRIA¬0.0000¬2023¬0280¬¬|0260¬1¬5% PRO-UNIVERSIDAD¬0.0000¬2023¬0280¬¬|1100¬1¬RECARGOS¬70.0000¬2023¬0280¬¬|0000¬1¬MULTAS¬0.0000¬2023¬0280¬¬|0000¬1¬DESCUENTOS RECARGOS¬0.0000¬2023¬0280¬¬|0000¬1¬DESCUENTOS MULTAS¬0.0000¬2023¬0280¬¬|0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬9.0000¬2023¬¬857¬|0220¬1¬15% APOYO A LA EDUCACION¬0.0000¬2023¬0661¬¬|0240¬1¬5% PRO-INDUSTRIA¬0.0000¬2023¬0661¬¬|0260¬1¬5% PRO-UNIVERSIDAD¬0.0000¬2023¬0661¬¬|1100¬1¬RECARGOS¬0.0000¬2023¬0661¬¬|0000¬1¬MULTAS¬0.0000¬2023¬0661¬¬|0000¬1¬DESCUENTOS RECARGOS¬0.0000¬2023¬0661¬¬|0000¬1¬DESCUENTOS MULTAS¬0.0000¬2023¬0661¬¬|
rfc: XAXX010101000
nombre: PRUEBA
paterno: PRUEBA
materno: PRUEBA
razonSocial:
calle: XXX
numeroExt: S/N
numeroInt:
colonia: CENTRO
codigoPostal: 62000
estados: 17|MORELOS
municipios: 901|CUERNAVACA
tipoDomicilio1:
referencia1: 3
ip:
explorador: PAGINA
isp:
paginaAnterior:
lineaCaptura:
numeroPoliza:
lineaOxxo:
fechaGeneracion:
curp:
fechaNacimiento:
idVehiculo:
noSeriev: PRUEBA10MARZ4
placav: ABC123D
placaAnterior:
noCilindros:
centimetrosCubicos: 0
modelo:
valorFactura:
valorVenta:
tonelaje: 0
combustible:
procedencia:
servicio: ,T: 08
capacidadPasajeros:
clase:
versionLineaId:
versionLineaCvMarca:
versionCvVersion:
estadoVehiculo:
tipoPlacaId:
motor:
fechaFactura:
tipoMovimiento: 100


ALTA_VEHICULO_NUEVO
opc	"8"
sistema	"64"
nombrePoliza	"ALTA+DE+VEHÍCULO+NUEVO"
fechaVencimiento	"00"
montoTotal	"1141"
observaciones	""
datosAdicionales	""
lineaDetalle	"0287¬1¬REGISTRO+EN+EL+PADRÓN+VEHICULAR+ESTATAL.+SERVICIO+PARTICULAR,+CON+EXPEDICIÓN+DE+PLACAS+METÁLICAS,+TARJETA+DE+CIRCULACIÓN,+ENGOMADO+Y+HOLOGRAMA:+AUTOS.¬1141.0¬2023¬¬1554¬|0220¬1¬15%+APOYO+A+LA+EDUCACION¬0.0¬2023¬0287¬¬|0240¬1¬5%+PRO-INDUSTRIA¬0.0¬2023¬0287¬¬|0260¬1¬5%+PRO-UNIVERSIDAD¬0.0¬2023¬0287¬¬|1100¬1¬RECARGOS¬0¬2023¬0287¬¬|0000¬1¬MULTAS¬0.0¬2023¬0287¬¬|0000¬1¬DESCUENTOS+RECARGOS¬0.0¬2023¬0287¬¬|0000¬1¬DESCUENTOS+MULTAS¬0.0¬2023¬0287¬¬|"
rfc	"XAXX010101000"
nombre	"XXXX"
paterno	"XXXX"
materno	"XXXX"
razonSocial	""
calle	"SIN+CALLE"
numeroExt	"S/N"
numeroInt	"12"
colonia	"CENTRO"
codigoPostal	"62000"
estados	"17|MORELOS"
municipios	"901|CUERNAVACA"
tipoDomicilio1	""
referencia1	"2"
ip	""
explorador	"PAGINA"
isp	""
paginaAnterior	""
lineaCaptura	""
numeroPoliza	""
lineaOxxo	""
fechaGeneracion	""
curp	""
fechaNacimiento	""
idVehiculo	"1"
noSeriev	"PRUEBA10MARZ5"
placav	""
placaAnterior	""
noCilindros	""
centimetrosCubicos	"0"
modelo	""
valorFactura	""
valorVenta	""
tonelaje	"0"
combustible	""
procedencia	""
servicio	"PARTICULAR,T:+01,TRAMITE:+ALTA"
capacidadPasajeros	""
clase	""
versionLineaId	""
versionLineaCvMarca	""
versionCvVersion	""
estadoVehiculo	""
tipoPlacaId	""
motor	""
fechaFactura	"2023-11-06"
tipoMovimiento	"100"


ALTA_VEHICULO_USADO
opc	"8"
sistema	"64"
nombrePoliza	"ALTA+DE+VEHÍCULO+USADO+O+FORÁNEO+CON+BAJA"
fechaVencimiento	"00"
montoTotal	"1608"
observaciones	""
datosAdicionales	""
lineaDetalle	"0287¬1¬REGISTRO+EN+EL+PADRÓN+VEHICULAR+ESTATAL.+SERVICIO+PARTICULAR,+CON+EXPEDICIÓN+DE+PLACAS+METÁLICAS,+TARJETA+DE+CIRCULACIÓN,+ENGOMADO+Y+HOLOGRAMA:+AUTOS.¬1141.0¬2023¬¬1551¬|0220¬1¬15%+APOYO+A+LA+EDUCACION¬0.0¬2023¬0287¬¬|0240¬1¬5%+PRO-INDUSTRIA¬0.0¬2023¬0287¬¬|0260¬1¬5%+PRO-UNIVERSIDAD¬0.0¬2023¬0287¬¬|1100¬1¬RECARGOS¬0¬2023¬0287¬¬|0000¬1¬MULTAS¬0.0¬2023¬0287¬¬|0000¬1¬DESCUENTOS+RECARGOS¬0.0¬2023¬0287¬¬|0000¬1¬DESCUENTOS+MULTAS¬0.0¬2023¬0287¬¬|0488¬1¬DEPOSITO+PARA+TRÁMITES+DE+BAJA+DE+OTRO+ESTADO¬467.0¬2023¬¬1551¬|0220¬1¬15%+APOYO+A+LA+EDUCACION¬0.0¬2023¬0488¬¬|0240¬1¬5%+PRO-INDUSTRIA¬0.0¬2023¬0488¬¬|0260¬1¬5%+PRO-UNIVERSIDAD¬0.0¬2023¬0488¬¬|1100¬1¬RECARGOS¬0.0¬2023¬0488¬¬|0000¬1¬MULTAS¬0.0¬2023¬0488¬¬|0000¬1¬DESCUENTOS+RECARGOS¬0.0¬2023¬0488¬¬|0000¬1¬DESCUENTOS+MULTAS¬0.0¬2023¬0488¬¬|"
rfc	"XAXX010101000"
nombre	"XXX"
paterno	"XXX"
materno	"XXX"
razonSocial	""
calle	"SIN+CALLE"
numeroExt	"S/N"
numeroInt	""
colonia	"CENTRO"
codigoPostal	"62000"
estados	"17|MORELOS"
municipios	"901|CUERNAVACA"
tipoDomicilio1	""
referencia1	"3"
ip	""
explorador	"PAGINA"
isp	""
paginaAnterior	""
lineaCaptura	""
numeroPoliza	""
lineaOxxo	""
fechaGeneracion	""
curp	""
fechaNacimiento	""
idVehiculo	"1"
noSeriev	"PRUEBA10MARZ5"
placav	""
placaAnterior	"ABC321D"
noCilindros	"50"
centimetrosCubicos	"0"
modelo	"2019"
valorFactura	"200000"
valorVenta	""
tonelaje	"0"
combustible	""
procedencia	"NACIONAL"
servicio	"PARTICULAR,T:+10,TRAMITE:+ALTA"
capacidadPasajeros	"4"
clase	""
versionLineaId	""
versionLineaCvMarca	""
versionCvVersion	""
estadoVehiculo	""
tipoPlacaId	""
motor	""
fechaFactura	"2023-11-06"
tipoMovimiento	"100"





BAJA
opc: 8
sistema: 64
nombrePoliza: BAJA
fechaVencimiento: 00
montoTotal: 1064
observaciones:
datosAdicionales:
lineaDetalle: 0280¬1¬REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬778.0000¬2023¬¬874¬|0220¬1¬15% APOYO A LA EDUCACION¬0.0000¬2023¬0280¬¬|0240¬1¬5% PRO-INDUSTRIA¬0.0000¬2023¬0280¬¬|0260¬1¬5% PRO-UNIVERSIDAD¬0.0000¬2023¬0280¬¬|1100¬1¬RECARGOS¬70.0000¬2023¬0280¬¬|0000¬1¬MULTAS¬0.0000¬2023¬0280¬¬|0000¬1¬DESCUENTOS RECARGOS¬0.0000¬2023¬0280¬¬|0000¬1¬DESCUENTOS MULTAS¬0.0000¬2023¬0280¬¬|0661¬1¬ACTUALIZACION REFRENDO ANUAL DE TARJETAS DE CIRCULACIÓN Y HOLOGRAMA: AUTO PARTICULAR¬9.0000¬2023¬¬874¬|0220¬1¬15% APOYO A LA EDUCACION¬0.0000¬2023¬0661¬¬|0240¬1¬5% PRO-INDUSTRIA¬0.0000¬2023¬0661¬¬|0260¬1¬5% PRO-UNIVERSIDAD¬0.0000¬2023¬0661¬¬|1100¬1¬RECARGOS¬0.0000¬2023¬0661¬¬|0000¬1¬MULTAS¬0.0000¬2023¬0661¬¬|0000¬1¬DESCUENTOS RECARGOS¬0.0000¬2023¬0661¬¬|0000¬1¬DESCUENTOS MULTAS¬0.0000¬2023¬0661¬¬|283¬1¬SERVICIOS DE CONTROL VEHICULAR BAJA DE REGISTRO EN EL PADRÓN VEHICULAR ESTATAL¬207.0¬2023¬¬874¬|0220¬1¬15% APOYO A LA EDUCACION¬0.0¬2023¬283¬¬|0240¬1¬5% PRO-INDUSTRIA¬0.0¬2023¬283¬¬|0260¬1¬5% PRO-UNIVERSIDAD¬0.0¬2023¬283¬¬|1100¬1¬RECARGOS¬0.0¬2023¬283¬¬|0000¬1¬MULTAS¬0.0¬2023¬283¬¬|0000¬1¬DESCUENTOS RECARGOS¬0.0¬2023¬283¬¬|0000¬1¬DESCUENTOS MULTAS¬0.0¬2023¬283¬¬|
rfc: XAXX010101000
nombre: PRUEBA
paterno: PRUEBA
materno: PRUEBA
razonSocial:
calle: XXX
numeroExt: S/N
numeroInt:
colonia: CENTRO
codigoPostal: 62000
estados: 17|MORELOS
municipios: 901|CUERNAVACA
tipoDomicilio1:
referencia1:
ip:
explorador: PAGINA
isp:
paginaAnterior:
lineaCaptura:
numeroPoliza:
lineaOxxo:
fechaGeneracion:
curp:
fechaNacimiento:
idVehiculo:
noSeriev: PRUEBA10MARZ4
placav: ABC123D
placaAnterior:
noCilindros:
centimetrosCubicos:
modelo:
valorFactura:
valorVenta:
tonelaje:
combustible:
procedencia:
servicio: ,T: 03
capacidadPasajeros:
clase:
versionLineaId:
versionLineaCvMarca:
versionCvVersion:
estadoVehiculo:
tipoPlacaId:
motor:
fechaFactura:
tipoMovimiento: 100




DUPLICADO TARJETA
opc: 8
sistema: 64
nombrePoliza: DUPLICADO DE TARJETA DE CIRCULACIÓN
fechaVencimiento: 00
montoTotal: 415
observaciones:
datosAdicionales:
lineaDetalle: 2004¬1¬DUPLICADO DE TARJETA DE CIRCULACIÓN¬415.0¬2023¬¬909¬|0220¬1¬15% APOYO A LA EDUCACION¬0.0¬2023¬2004¬¬|0240¬1¬5% PRO-INDUSTRIA¬0.0¬2023¬2004¬¬|0260¬1¬5% PRO-UNIVERSIDAD¬0.0¬2023¬2004¬¬|1100¬1¬RECARGOS¬0.0¬2023¬2004¬¬|0000¬1¬MULTAS¬0.0¬2023¬2004¬¬|0000¬1¬DESCUENTOS RECARGOS¬0.0¬2023¬2004¬¬|0000¬1¬DESCUENTOS MULTAS¬0.0¬2023¬2004¬¬|
rfc: XAXX010101000
nombre: CARLOS ALBERTO
paterno: NAZARIO
materno: RANGEL
razonSocial:
calle: SIN CALLE
numeroExt: 12
numeroInt:
colonia: CENTRO
codigoPostal: 62550
estados: 17|MORELOS
municipios: 901|CUERNAVACA
tipoDomicilio1:
referencia1: 3
ip:
explorador: PAGINA
isp:
paginaAnterior:
lineaCaptura:
numeroPoliza:
lineaOxxo:
fechaGeneracion:
curp:
fechaNacimiento:
idVehiculo:
noSeriev: 9BWAB45U4KT082887
placav: RBK258A
placaAnterior:
noCilindros:
centimetrosCubicos: 0
modelo:
valorFactura:
valorVenta:
tonelaje: 0
combustible:
procedencia:
servicio: ,T: 05
capacidadPasajeros:
clase:
versionLineaId:
versionLineaCvMarca:
versionCvVersion:
estadoVehiculo:
tipoPlacaId:
motor:
fechaFactura:
tipoMovimiento: 100
*/
