import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { Router } from '@angular/router';
import { DatosPoliza } from '../../interfaces/datos-poliza';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TopLevel } from '../../interfaces/calculo-conceptos';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';

@Component({
  selector: 'shared-datos-contribuyente',
  templateUrl: './datos-contribuyente.component.html',
  styleUrls: ['./datos-contribuyente.component.css']
})
export class DatosContribuyenteComponent implements OnInit {

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
    nombre: [],
    primerApellido: [],
    segundoApellido: [],
    razonSocial: [],
    rfc: [],
    curp: [],
    domicilio: this.fb.group({
      calle: [],
      numeroExterior: [],
      numeroInterior: [],
      colonia: [],
      codigoPostal: [],
      municipio: [],
      observaciones: []
    })
  });

  constructor(
    private fb:FormBuilder,
    private router: Router,
    private _snackBar: MatSnackBar,
    private smytService: SmytService
  ) { }
  ngOnInit(): void {
    if(!localStorage.getItem('contribuyente')) {
      this.openSnackBar('No se cuenta con información para continuar con el proceso')
      setTimeout(()=>{
        this.router.navigate(['pagos']);
      },2500)

    }
    this.contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente')!);
    console.log(this.contribuyenteArr)
    this.myFormContribuyente.reset(this.contribuyenteArr.data.contribuyente);
    this.myFormContribuyente.get('domicilio')?.reset(this.contribuyenteArr.data.domicilio);
  }

  generarPoliza(): void {

    this.isLoading = true;

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
   this.dataPoliza.detalle = this.contribuyenteArr.data.lineaDetalle;  /*Object.entries(this.contribuyenteArr[3]).forEach(val => { this.dataPoliza.total = val[1]; })//this.dataPoliza.total = Object.entries(this.contribuyenteArr[3]).forEach((title,val:number) => val.toString );
   Object.entries(this.contribuyenteArr[0]).map(([key,val]) => {
    Object.entries(this.dataPoliza).map(([llave,valor])=> console.log(llave))
   })*/
   //this.dataPoliza.
    console.log(this.dataPoliza)
   //Object.entries(this.contribuyenteArr[0]).forEach(r => console.log(r[1]))
    //this.router.navigate(['pagos/generar_poliza']);

    this.smytService.generarPolizaServ(this.dataPoliza)
      .subscribe(resp => {
        if ( resp.success) {
          this.isLoading = false;
          localStorage.setItem('datos_poliza',JSON.stringify(resp.poliza));
          this.router.navigate(['pagos/generar_poliza']);
        }
      });
  }

  isValidField(field: string) {

  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2000
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
