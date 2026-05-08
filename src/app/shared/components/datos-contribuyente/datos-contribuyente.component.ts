import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
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

import ListaIngresoEnajenacion from '../../../../../data/arreglos/tipo_ingresos_enajenacion.json';
import { formatDate } from '@angular/common';
import { FileTransferService } from 'src/app/portal-hacienda/services/file-transfer.service';
import Swal from 'sweetalert2';
import { environments } from 'src/environments/environments';

@Component({
  selector: 'shared-datos-contribuyente',
  templateUrl: './datos-contribuyente.component.html',
  styleUrls: ['./datos-contribuyente.component.css']
})
export class DatosContribuyenteComponent implements OnInit, AfterViewInit {

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
    tipoPersona: ['F', [Validators.required]],
    nombre: ['', [Validators.required]],
    primerApellido: [''],
    segundoApellido: [''], /* TODO: 10/06/2025 Carlos A. se quito la condicion de requerido  */
    razonSocial: [{ value: '', disabled: true }, [Validators.required]],
    rfc: ['XAXX010101000', [Validators.required, Validators.pattern(this.validatosService.rfcFisica)]],
    curp: [''],
    domicilio: this.fb.group({
      calle: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
      numeroExterior: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
      numeroInterior: [''],
      colonia: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
      codigoPostal: ['', [Validators.required, Validators.pattern(this.validatosService.exprCp)]],
      estados: [{ value: '17', disabled: true }, [Validators.required, Validators.min(1)]],
      municipio: ['', [Validators.required, Validators.min(1)]],
      observaciones: ['', [Validators.maxLength(900)]]
    })
  },
    {
      validators: [this.validatosService.validateDataInput('nombre', 1, 'contribuyente')],
    }
  );

  private url = environments.URL_PAGO_EN_LINEA_RECIBO + '/poliza/imprimirPoliza?lineaCaptura=';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _snackBar: MatSnackBar,
    private smytService: SmytService,
    private validatosService: ValidatorsService,
    private serviciosGenerales: GeneralesService,
    private serviceFileTransfer: FileTransferService
  ) { }

  ngAfterViewInit(): void {
    const contribuyente = JSON.parse(sessionStorage.getItem('contribuyente')!);

    // Extraemos la referencia para que el código sea más legible
    const dataC = contribuyente?.data?.contribuyente;

    // 1. Definimos un array para los validadores de control individual
    // Esto es para los validadores simples (Required)
    if (!!dataC) {
      // Evaluamos: ¿Existe la propiedad? ¿Es diferente de null/undefined? ¿Es diferente de ""?
      const tienePrimerApe = dataC.primerApellido && dataC.primerApellido.trim() !== '';
      const tieneSegundoApe = dataC.segundoApellido && dataC.segundoApellido.trim() !== '';

      if (tienePrimerApe) {
        this.myFormContribuyente.get('primerApellido')?.setValidators([Validators.required]);
      }
      if (tieneSegundoApe) {
        this.myFormContribuyente.get('segundoApellido')?.setValidators([Validators.required]);
      }
    } else {
      // Si no hay datos, por defecto el primer apellido suele ser obligatorio
      this.myFormContribuyente.get('primerApellido')?.setValidators([Validators.required]);
    }

    // Llamada a la configuración de validadores de grupo (como vimos antes)
    this.configurarValidadoresDinamicos(dataC);


  }

  @HostListener('input', ['$event']) onKeyUp(event: any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  ngOnInit(): void {
    if (!sessionStorage.getItem('contribuyente')) {
      this.openSnackBar('No se cuenta con información para continuar con el proceso')
      setTimeout(() => {
        this.router.navigate(['pagos']);
      }, 2500);

    }
    /*
      OBTIENE LISTA DE ENTIDADES FEDERATIVAS
      MODIF: 12/12/2023
    */
    this.serviciosGenerales.getEntidadesFederativas().subscribe(resp => {
      if (!resp) {
        this.openSnackBar('Problema con el API-SERVER, favor de contactar a Servicio Técnico ');
      } else {
        let route_origen: string = sessionStorage.getItem('route_origen')!;
        if (route_origen.includes('smyt-licencia')) {
          this.openSnackBar('Si ya cuenta con una licencia expedida por el Gobierno del Estado de Morelos, favor de anotar el número en observaciones')
        }



        this.arrEstados = resp?.data;
        this.myFormContribuyente.get('domicilio')?.get('estados')?.setValue(17);
        if (sessionStorage.getItem('gestora') !== '64') {
          this.myFormContribuyente.get('domicilio')?.get('estados')?.enable();
        } else {
          this.myFormContribuyente.get('domicilio')?.get('observaciones')?.disable();
        }
        this.changeEstado('17');
      }
    });

    this.contribuyenteArr = JSON.parse(sessionStorage.getItem('contribuyente')!);


    /* Si es una persona Moral se deshabilita datos de Persona fisica y habilita RazonSocial */
    /*if(this.contribuyenteArr.data.contribuyente && this.contribuyenteArr.data.contribuyente.tipoPersona === 'M') {
      this.disabledEnabledElement(['nombre','primerApellido','segundoApellido','curp'],['razonSocial']);
      this.tipoPersona = 'M';
    }*/

    /* MODIF: 12/12/2023 */
    const datos: ReintegrosStruct = JSON.parse(sessionStorage.getItem('datos_cobro')!);
    if (sessionStorage.getItem('gestora') !== '64') {
      this.TaxDataControl = false;
    }
    /*if (sessionStorage.getItem('gestora') == '90' && datos !== null && datos.tipo_form == 9) {
      this.TaxDataControl = true;
      this.myFormContribuyente.get('tipoPersona')?.disable();
    }*/
  }

  /* Carlos A 28/04/2026 - Configurar validadores dinámicos */
  private configurarValidadoresDinamicos(dataC: any): void {
    const groupValidators = [
      this.validatosService.validateDataInput('nombre', 1, 'contribuyente'),
      this.validatosService.validateDataInput('razonSocial', 8, 'contribuyente')
    ];

    // Si después de la evaluación anterior el control tiene el validador 'required'
    if (this.myFormContribuyente.get('primerApellido')?.hasValidator(Validators.required)) {
      groupValidators.push(this.validatosService.validateDataInput('primerApellido', 2, 'contribuyente'));
    }

    if (this.myFormContribuyente.get('segundoApellido')?.hasValidator(Validators.required)) {
      groupValidators.push(this.validatosService.validateDataInput('segundoApellido', 3, 'contribuyente'));
    }

    this.myFormContribuyente.setValidators(groupValidators);
    this.myFormContribuyente.updateValueAndValidity();
  }

  /*
      SE DISPARA AL SELECCIONAR UN ESTADO
      MODIF: 12/12/2023
  */
  changeEstado(event: string): void {
    this.serviciosGenerales.getMunicipios(Number(event))
      .subscribe(resp => {
        if (!resp || resp.data.length == 0) {
          this.openSnackBar('Problema con el API-SERVER, favor de contactar a Servicio Técnico ');
        } else {
          this.arrMunicipios = resp.data;
        }

      });
  }

  changeTaxData(event: boolean) {
    if (event) {
      this.myFormContribuyente.get('tipoPersona')?.setValue('F');
      this.myFormContribuyente.get('tipoPersona')?.disable();
      this.changeRadioTP('F');
      this.disabledEnabledElement(['razonSocial', 'rfc', 'curp', 'domicilio'], []);
      this.myFormContribuyente.get('domicilio')?.get('observaciones')?.enable();
      return;
    }
    this.disabledEnabledElement([], ['rfc', 'curp', 'domicilio']);
    this.myFormContribuyente.get('tipoPersona')?.enable()
    return;
  }

  onKeyPress(stringTag: string) {
    this.myFormContribuyente.get('nombre')?.setValue(stringTag);
  }

  getMessage(idMssg: number, nameField: string) {
    let touched = this.myFormContribuyente.get('domicilio')?.get(nameField)?.touched;
    let nameFileValue = this.myFormContribuyente.get('domicilio')?.get(nameField)?.value;
    let pathSelect = this.validatosService.streetNamePath;

    /* TODO: 10/06/2025 Carlos A. mientras no se evalue apellido materno entra a la condicion  */
    if (idMssg !== null) {
      const message = this.mssgArr.filter(({ id }) => id == idMssg)
      return message[0].msg;
    }
    if (nameField === 'nombre' || nameField === 'primerApellido' || nameField === 'segundoApellido' /*|| nameField === 'razonSocial'*/) {
      /* TODO: 10/06/2025 Carlos A. Si apellido materno o paterno esta vacio, se elima la validacion  */
      if (nameField === 'segundoApellido' && this.myFormContribuyente.get('segundoApellido')?.value.trim() === '') {
        //console.log("Aqui entrooooo")
        this.myFormContribuyente.get('segundoApellido')?.clearValidators();
        this.myFormContribuyente.get('segundoApellido')?.updateValueAndValidity();
        return '';
      }
      if (nameField === 'primerApellido' && this.myFormContribuyente.get('primerApellido')?.value.trim() == '') {
        this.myFormContribuyente.get('primerApellido')?.clearValidators();
        this.myFormContribuyente.get('primerApellido')?.updateValueAndValidity();
        return '';
      }
      touched = this.myFormContribuyente.get(nameField)?.touched;
      nameFileValue = this.myFormContribuyente.get(nameField)?.value;
      pathSelect = this.validatosService.peoplesNamePath;
    }
    if (nameField === 'razonSocial') {
      touched = this.myFormContribuyente.get(nameField)?.touched;
      nameFileValue = this.myFormContribuyente.get(nameField)?.value;
      pathSelect = this.validatosService.peoplesNamePathWithNumbers;
    }

    if (touched) {
      let idMessage = 101;

      let pattern = new RegExp(pathSelect);
      if (!pattern.test(nameFileValue) || nameFileValue == null) {
        if (nameFileValue === null) {
          idMessage = 100;
        }
        const message = this.mssgArr.filter(({ id }) => id == idMessage);
        this.myFormContribuyente.get('domicilio')?.get(nameField)?.setErrors({ notEqual: true, error: idMessage });
        if (nameField === 'nombre' || nameField === 'primerApellido' || nameField === 'segundoApellido' || nameField === 'razonSocial')
          this.myFormContribuyente.get(nameField)?.setErrors({ notEqual: true, error: idMessage });

        return message[0].msg;
      }

    }
    return '';
  }

  disabledEnabledElement(element: string[], enabledElement: string[]) {
    element.forEach(element => {
      const control = this.myFormContribuyente.get(element);
      control?.disable();
      control?.setValue('', { emitEvent: false });
    });
    enabledElement.forEach(element => {
      const control = this.myFormContribuyente.get(element);
      control?.enable();
      control?.setValue(''); // Aseguramos que inicie limpio
      control?.markAsPristine(); // Es mejor marcarlo como limpio (Pristine) al habilitar
      control?.markAsUntouched(); // También es buena práctica marcarlo como no tocado (Untouched)
      control?.updateValueAndValidity();
    });
  }

  changeRadioTP(evento: string): void {
    this.tipoPersona = evento;
    const rfcControl = this.myFormContribuyente.get('rfc');

    if (evento === 'M') {
      // Deshabilitar campos de Física, Habilitar Razón Social
      this.disabledEnabledElement(['nombre', 'primerApellido', 'segundoApellido', 'curp'], ['razonSocial']);
      rfcControl?.setValue('');
      rfcControl?.clearValidators();
      rfcControl?.setValidators([Validators.required, Validators.pattern(this.validatosService.rfcMoral)]);
    } else {
      // Deshabilitar Razón Social, Habilitar campos de Física
      this.disabledEnabledElement(['razonSocial'], ['nombre', 'primerApellido', 'segundoApellido', 'curp']);
      //this.myFormContribuyente.get('razonSocial')?.enable(); //.addValidators([]);
      rfcControl?.setValue('XAXX010101000');
      rfcControl?.clearValidators();
      rfcControl?.setValidators([Validators.required, Validators.pattern(this.validatosService.rfcFisica)]);
      this.myFormContribuyente.updateValueAndValidity();
    }
    rfcControl?.updateValueAndValidity();
  }

  monthDescription(valor: number): string {

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
  generarPoliza_response(): void {

    const datos: ReintegrosStruct = JSON.parse(sessionStorage.getItem('datos_cobro')!);
    const gestora = sessionStorage.getItem('gestora')!;
    if (!this.contribuyenteArr.data.contribuyente) {
      this.contribuyenteArr.data.contribuyente = {
        nombre: '',
        tipoPersona: '',
        razonSocial: '',
        primerApellido: '',
        segundoApellido: '',
        rfc: '',
        curp: '',
        id: 0,
      };
      this.contribuyenteArr.data.contribuyente.nombre = String(this.myFormContribuyente.get('nombre')?.value).toUpperCase();
      this.contribuyenteArr.data.contribuyente.primerApellido = String(this.myFormContribuyente.get('primerApellido')?.value).toUpperCase();
      this.contribuyenteArr.data.contribuyente.segundoApellido = String(this.myFormContribuyente.get('segundoApellido')?.value).toUpperCase();
      sessionStorage.setItem('contribuyente_only', JSON.stringify(this.contribuyenteArr));
    }

    this.isLoading = true;
    this.buttBlock = true;
    let vehicle_data = {} as VehicleData;
    let datosAdicionales: string = '';
    let datosAdicionales_adic: string = '';
    let servicio = '';
    let tipoSer = [];
    let observaciones = (this.myFormContribuyente.get('domicilio')?.get('observaciones')?.value) ? String(this.myFormContribuyente.get('domicilio')?.get('observaciones')?.value).toUpperCase() : "";
    const dataVehicle_adit = JSON.parse(sessionStorage.getItem('vehicle_data_adicional')!);
    let route_origen: string = sessionStorage.getItem('route_origen')?.replaceAll('-', '').toUpperCase()!;

    Object.entries(TipoServicio).forEach((v, k) => {
      tipoSer = v.toString().split(',');
      if (tipoSer[0] == route_origen.split('/').find((v, k) => k == 1)) {
        servicio = tipoSer[1];//',' + tipoSer[1];
      }
    });

    const concept = (sessionStorage.getItem('concept')) ? sessionStorage.getItem('concept')?.toString() : '';
    if (sessionStorage.getItem('vehicle_data')) {
      vehicle_data = JSON.parse(sessionStorage.getItem('vehicle_data')!);
      let fecha_factura = '';
      let fecha_factura_array: Array<any> = [];

      if (vehicle_data.fechaFactura) {
        fecha_factura_array = String(vehicle_data.fechaFactura).split('/')
        fecha_factura = String(fecha_factura_array[2]) + '-' + String(fecha_factura_array[1]).padStart(2, '0') + '-' + String(fecha_factura_array[0]).padStart(2, '0');
      }

      datosAdicionales_adic = datosAdicionales = `PLACA: ${vehicle_data.placa.toUpperCase()},PLACA ANTERIOR: ${(vehicle_data.placaAnterior) ? vehicle_data.placaAnterior.toUpperCase() : (dataVehicle_adit && dataVehicle_adit.placaAnterior) ? dataVehicle_adit.placaAnterior : ''},,,,,MODELO: ${(vehicle_data.modelo) ? vehicle_data.modelo.toString() : ''},,,,MOTOR: ,FECHA FACTURA: ${fecha_factura},VALOR FACTURA: ${(vehicle_data.valorFactura) ? vehicle_data.valorFactura.toString() : ''},PROCEDENCIA: ${(dataVehicle_adit && dataVehicle_adit.procedencia) ? dataVehicle_adit.procedencia : ''},,NO DE SERIE: ${vehicle_data.numeroSerie},VALOR VENTA: ,SERVICIO:` + ((servicio == 'T: 01' || servicio == 'T: 13') ? ' PARTICULAR' : ' ');// +
      if (servicio == 'T: 13' && vehicle_data.pagoBaja == 2) {
        datosAdicionales_adic += ",T: 10";
      } else {
        datosAdicionales_adic += `,${servicio}`;
      }
      datosAdicionales_adic += ((servicio == 'T: 13' || servicio == 'T: 01') ? ',TRAMITE: ALTA' : '');
    }

    if ((servicio == 'T: 08' || servicio == 'T: 01' || servicio == 'T: 13' || servicio == 'T: 03' || servicio == 'T: 05' || servicio == 'T: 02') && (gestora == '64')) {
      datosAdicionales = datosAdicionales_adic + ((observaciones !== '') ? '| OBSERVACIONES: ' : '') + observaciones;
      observaciones = datosAdicionales_adic + '.' + ((observaciones !== '') ? ' OBSERVACIONES: ' : '') + observaciones;
    }
    if (servicio.length == 0 && (gestora == '22' || gestora == '9' || gestora == '53' || gestora == '75' || gestora == '30' || gestora == '68' || gestora == '14' || gestora == '73' || gestora == '70' || gestora == '66' || gestora == '57')) {
      datosAdicionales = ((gestora !== '70') ? (((observaciones !== '') ? 'OBSERVACIONES: ' : '') + observaciones) : '');
      observaciones = ((observaciones !== '') ? 'OBSERVACIONES: ' : '') + observaciones;

      if (gestora == '22' && (dataVehicle_adit && dataVehicle_adit.licencia)) {
        let fecha_vencimiento = '';
        let fecha_vencimiento_array: Array<any> = [];
        fecha_vencimiento_array = String(dataVehicle_adit.fecha_vencimiento).split('/')
        fecha_vencimiento = String(fecha_vencimiento_array[2]) + '-' + String(fecha_vencimiento_array[1]).padStart(2, '0') + '-' + String(fecha_vencimiento_array[0]).padStart(2, '0');

        observaciones = ((observaciones !== '') ? '' : 'OBSERVACIONES: ') + `${observaciones} No. Licencia: ${String(dataVehicle_adit.licencia).toUpperCase()} ,Fecha vencimiento: ${fecha_vencimiento},.`
        datosAdicionales = observaciones;
      }
    }
    observaciones = observaciones.trim()


    if (datos) {
      if (datos.tipo_form && (datos.tipo_form == 17 || datos.tipo_form == 16 || datos.tipo_form == 14)) {
        observaciones += `,${datos.dependencia}`;
        if (datos.tipo_form == 17) {
          observaciones += `,${datos.fecha_retencion},${datos.ejercicio_fiscal},${datos.nombre_fondo},${datos.numero_contrato},${datos.objeto_contrato},${datos.fuente_financiamiento},${datos.monto_ejercido},${datos.monto_retenido},${datos.numero_oficio},${datos.numero_factura}`;
        }
        datosAdicionales += `ContribuyenteReintegro: ${datos.nombre},${datos.telefono},${datos.email}`;
      } else {
        this.dataPoliza.fechaVencimiento = datos.fechaVencimiento;
        /*if(datos.tipo_form && datos.tipo_form==3) {
          datosAdicionales = `OBSERVACIONES: Fecha próxima de verificación: ${observaciones} ` + datos.fecha_verificacion + ', Placa: ' + datos.placa + ', Serie: ' + datos.serie;
        }*/
        /* DESARROLLO SUSTENTABLE - CALIDAD DEL AIRE CERTIFICACION VERIFICACION */
        if (datos.tipo_form && datos.tipo_form == 12) {
          datosAdicionales = `Numero de Folio:${datos.folio},Año:${datos.anio},Tipo:${datos.certificacion},Semestre:${datos.semestre} `;
          if (observaciones !== '')
            datosAdicionales += `OBSERVACIONES: ${observaciones} `;
        }
        /* DESARROLLO SUSTENTABLE - DATOS POR EL INCUMPLIMIENTO DE VERIFICACION */
        if (datos.tipo_form && datos.tipo_form == 3) {
          if (observaciones !== '') {
            //datosAdicionales = `OBSERVACIONES: ${observaciones} `;
            datosAdicionales = `${observaciones} `;

          }
          if (datos.fecha_verificacion) {
            datosAdicionales += `Fecha próxima verificacion: ${datos.fecha_verificacion},`
          }
          datosAdicionales += ` Placa: ${datos.placa}, Serie: ${datos.serie}`;
        }

        if (datos.tipo_form && datos.tipo_form == 6) {
          if (observaciones !== '') {
            //datosAdicionales = `OBSERVACIONES: ${observaciones} `;
            //datosAdicionales = `${observaciones} `;

          }
          datosAdicionales += `Escritura: ${datos.escritura}, Fecha escritura: ${datos.fecha_verificacion_escritura}, Contribuyente: ${datos.contribuyente}`
          observaciones = datosAdicionales += (observaciones !== '') ? ` OBSERVACIONES: ${observaciones}` : '';


        }
        /* HACIENDA - IMPUESTOS - ISAN */
        if (datos.tipo_form && datos.tipo_form == 4) {
          datosAdicionales = `${datos.concepto!}-${this.monthDescription(Number(datos.periodo))}-${datos.ejercicio}`;
          observaciones = datosAdicionales += (observaciones !== '') ? ` OBSERVACIONES: ${observaciones}` : '';
        }


        /* HACIENDA - IMPUESTOS - CEDULAR POR LA ENAJENACION DE BIENES INMUEBLES */
        if (datos.tipo_form && datos.tipo_form == 9) {
          const tipo_ingreso = ListaIngresoEnajenacion.find(ingreso => ingreso.id == Number(datos.tipo_ingresos));
          datosAdicionales = tipo_ingreso ? `Tipo de ingreso: ${tipo_ingreso.descripcion}` : '';
          observaciones = ` OBSERVACIONES: ,Escritura: ${datos.tiene_escritura == '1' ? datos.escritura : 'SIN ESCRITURA'},Tiene exención: ${datos.tiene_exencion == '1' ? 'SI' : 'NO'},Fecha de enajenación: ${datos.fecha_enajenacion},Fecha de Provisional de Escritura: ${datos.fecha_provisional_escritura},Teléfono: ${datos.noPhone},Email: ${datos.email},Referencia_inmueble: ${datos.referencia_inmueble},Monto_Avaluó: ${datos.monto_avaluo},Ingreso de enajenación: ${datos.ingreso_enajenacion},Base_Impuesto: ${datos.base_impuesto},Tipo de Transmisión de Propiedad: Enajenación,Nombre del Notario: ${datos.nombre},RFC del Notario: ${datos.rfc},Notaría: ${datos.notaria},Entidad: ${datos.entidad_descripcion},Demarcación: ${datos.demarcacion_descripcion},Nombre del Perito: ${datos.nombre_perito},RFC o Cédula del Perito: ${datos.rfc_perito}. ${observaciones}`;// + (observaciones!=='')?`observaciones: ${observaciones}`:'';
          // if(datos.tiene_exencion=="1"){
          //   this.contribuyenteArr.data.lineaDetalle = "4124734¬0383¬1¬IMPUESTO CEDULAR POR LA ENAJENACIÓN DE BIENES INMUEBLES¬2026¬0.00¬¬6673¬0.00¬|"
          //   this.contribuyenteArr.data.total = 0;
          // }else{
          this.contribuyenteArr.data.lineaDetalle = "4124734¬0383¬1¬IMPUESTO CEDULAR POR LA ENAJENACIÓN DE BIENES INMUEBLES¬2026¬" + this.contribuyenteArr.data.total + "¬¬6673¬" + this.contribuyenteArr.data.total + "¬|"
          //   this.contribuyenteArr.data.total = this.contribuyenteArr.data.total;
          // }

          //this.contribuyenteArr.data.total = 0;

        }
        /* Carlos A. 2302/2026 CONTROL VEHICULAR - SERVICIO PUBLICO - EXPEDICION ANUAL DE GAFETE DE OPERADOR */
        if (datos.tipo_form && datos.tipo_form == 19) {
          observaciones = ` OBSERVACIONES: No Licencia: ${datos.licencia!}`;
          //observaciones = ` OBSERVACIONES: Placa: ${datos.placa!}, Agrupación: ${datos.agrupacion!}, Número Económico: ${datos.numero_economico!}`;
          //this.contribuyenteArr.data.lineaDetalle = this.contribuyenteArr.data.lineaDetalle;
          //this.contribuyenteArr.data.observaciones = `Placa: ${datos.placa!}, Agrupación: ${datos.agrupacion!}, Número Económico: ${datos.numero_economico!}`;
          this.contribuyenteArr.data.observaciones = `No Licencia: ${datos.licencia!}`;
        }
      }
    }

    let estado: string = '';
    let municipio: string = '';
    let estadoPeticion: boolean = false;
    this.serviciosGenerales.getEntidadesFederativas(this.myFormContribuyente.get('domicilio')?.get('estados')?.value)
      .subscribe({
        next: value => {
          if (value!.data.length > 0) {
            estado = value!.data[0].descripcion;
          }
        },
        complete: () => {
          //estadoPeticion = true
          if (this.myFormContribuyente.get('domicilio')?.get('municipio')?.value !== '' && this.myFormContribuyente.get('domicilio')?.get('municipio')?.value > 0) {
            this.serviciosGenerales.getMunicipios(this.myFormContribuyente.get('domicilio')?.get('estados')?.value, this.myFormContribuyente.get('domicilio')?.get('municipio')?.value)
              .subscribe({
                next: (value) => {
                  if (value!.data.length > 0) {
                    municipio = value!.data[0].descripcion;
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
      if (estadoPeticion) {
        let razonSocial: string = this.myFormContribuyente.get('razonSocial')?.value;

        const movimiento = sessionStorage.getItem('movimiento')!;

        //observaciones += (this.myFormContribuyente.get('domicilio')?.get('observaciones')?.value)?' OBSERVACIONES: ' + String(this.myFormContribuyente.get('domicilio')?.get('observaciones')?.value).toUpperCase():'';

        this.dataPoliza.sistema = gestora;
        this.dataPoliza.movimiento = movimiento;//this.movimiento.toString();
        this.dataPoliza.total = this.contribuyenteArr.data.total;
        this.dataPoliza.rfc = (this.myFormContribuyente.get('rfc')?.value) ? this.myFormContribuyente.get('rfc')?.value : 'XAXX010101000';
        this.dataPoliza.nombre = ((razonSocial.length > 0) ? this.myFormContribuyente.get('razonSocial')?.value : String(this.myFormContribuyente.get('nombre')?.value).toUpperCase());
        this.dataPoliza.primerApellido = String(this.myFormContribuyente.get('primerApellido')?.value).toUpperCase();
        this.dataPoliza.segundoApellido = String(this.myFormContribuyente.get('segundoApellido')?.value).toUpperCase();
        this.dataPoliza.razonSocial = String(this.myFormContribuyente.get('razonSocial')?.value).toUpperCase();
        this.dataPoliza.tipoPersona = this.myFormContribuyente.get('tipoPersona')?.value;
        this.dataPoliza.origen = 'PH';
        this.dataPoliza.calle = (this.myFormContribuyente.get('domicilio')?.get('calle')?.value) ? String(this.myFormContribuyente.get('domicilio')?.get('calle')?.value).toUpperCase() : '.';
        this.dataPoliza.numeroExterior = (this.myFormContribuyente.get('domicilio')?.get('numeroExterior')?.value) ? this.myFormContribuyente.get('domicilio')?.get('numeroExterior')?.value : 0;
        this.dataPoliza.numeroInterior = this.myFormContribuyente.get('domicilio')?.get('numeroInterior')?.value;
        this.dataPoliza.colonia = (this.myFormContribuyente.get('domicilio')?.get('colonia')?.value) ? String(this.myFormContribuyente.get('domicilio')?.get('colonia')?.value).toUpperCase() : ".";
        this.dataPoliza.municipio = (municipio !== '') ? municipio : 'CUERNAVACA';
        this.dataPoliza.estado = (estado) ? estado : 'MORELOS';
        this.dataPoliza.codigoPostal = (this.myFormContribuyente.get('domicilio')?.get('codigoPostal')?.value) ? this.myFormContribuyente.get('domicilio')?.get('codigoPostal')?.value : 62000;
        /*TODO: Carlos A 18/04/2025 inicio*/
        this.dataPoliza.observaciones = (gestora == '64' || gestora == '40') ? this.contribuyenteArr.data.observaciones! : ((observaciones !== '') ? (observaciones.includes('OBSERVACIONES:')) ? observaciones : `OBSERVACIONES: ${observaciones}` : ''); //observaciones;////(gestora=='64' || gestora=='40')?observaciones:((observaciones!=='')?(observaciones.includes('OBSERVACIONES:'))?observaciones:`OBSERVACIONES: ${observaciones}`:''); //observaciones;//
        this.dataPoliza.datosAdicionales = (gestora == '64' || gestora == '40') ? this.contribuyenteArr.data.observaciones! : datosAdicionales;//datosAdicionales;
        /*TODO: Carlos A 18/04/2025 fin*/
        this.dataPoliza.detalle = this.contribuyenteArr.data.lineaDetalle;
        if (Object.entries(vehicle_data).length > 0) {
          this.dataPoliza.datosVehiculo = vehicle_data;
        }
        if (gestora == '53') {
          this.dataPoliza.observaciones = this.dataPoliza.datosAdicionales;
        }
        /*TODO: Carlos A 18/04/2025 */
        if (vehicle_data.tramite == 9 || (vehicle_data.tramite == 1 && !!vehicle_data.numeroConcesion) || (vehicle_data.tramite == 3 && !!vehicle_data.numeroConcesion) && vehicle_data.valorVenta == null) {
          this.dataPoliza.datosVehiculo!.tipo = 2;
        }


        this.smytService.generarPolizaServ(this.dataPoliza)
          .subscribe(resp => {
            this.isLoading = false;
            this.buttBlock = false;
            if (resp.success) {
              /* SI EXCISTE UN IMPUESTO QUE USE datos_cobro*/
              if (datos !== null) {
                /* SI ES EL IMPUESTO DE ENAJENACION  Y TIENE EXENCIONES*/
                if (datos.tipo_form && datos.tipo_form == 9) {
                  const formValue = this.myFormContribuyente.value
                  let formData = new FormData();
                  // Agregar datos del formulario
                  formData.append('cantidad', '1');
                  formData.append('baseImpuesto', datos.base_impuesto?.toString() || '');
                  formData.append('percentBaseImpuesto', datos.percent_base_impuesto?.toString() || '');
                  formData.append('escritura', datos.escritura || '');
                  formData.append('rfcPerito', datos.rfc_perito || '');
                  formData.append('fechaEnajenacion', datos.fecha_enajenacion || '');
                  formData.append('fechaProvisionalEscritura', datos.fecha_provisional_escritura || '');
                  formData.append('tipoIngresos', datos.tipo_ingresos || '');
                  formData.append('tipoForm', datos.tipo_form?.toString() || '');
                  formData.append('noPhone', datos.noPhone || '');
                  formData.append('email', datos.email || '');
                  formData.append('referenciaInmueble', datos.referencia_inmueble || '');
                  formData.append('montoAvaluo', datos.monto_avaluo?.toString() || '');
                  formData.append('ingresoEnajenacion', datos.ingreso_enajenacion?.toString() || '');
                  formData.append('tieneEscritura', datos.tiene_escritura || '');
                  formData.append('tieneExencion', datos.tiene_exencion || '');
                  formData.append('comisionesMediaciones', datos.comisiones_mediaciones?.toString() || '');
                  formData.append('costoComprobado', datos.costo_comprobado?.toString() || '');
                  formData.append('gastosNotariales', datos.gastos_notariales?.toString() || '');
                  formData.append('importeInversion', datos.importe_inversion?.toString() || '');
                  formData.append('otrasDeducciones', datos.otras_deducciones?.toString() || '');
                  formData.append('nombre', datos.nombre || '');
                  formData.append('rfc', datos.rfc || '');
                  formData.append('notaria', datos.notaria || '');
                  formData.append('entidad', datos.entidad || '');
                  formData.append('demarcacion', datos.demarcacion || '');
                  formData.append('nombrePerito', datos.nombre_perito || '');
                  formData.append('domicilioPerito', datos.domicilio_perito || '');
                  formData.append('concepto', ListaIngresoEnajenacion.find(ingreso => ingreso.id == Number(datos.tipo_ingresos))?.descripcion || '');
                  formData.append('lineaCaptura', resp.poliza.lineaCaptura || '');
                  formData.append('archivo', this.serviceFileTransfer.getFile()!);

                  this.serviciosGenerales.uploadFile(formData).subscribe({
                    next: (response) => {

                      Swal.fire(
                        {
                          icon: "success",
                          title: "Operación realizada con éxito!!!",
                          html: `Para validar su trámite conserve la linea de captura y consulte en linea su póliza
                          <button type="button" id="btn-poliza" class="bg-primary border-primary-500 px-3 py-2 text-base border-1 border-solid border-round cursor-pointer transition-all transition-duration-200 hover:bg-primary-600 hover:border-primary-600 active:bg-primary-700 active:border-primary-700">Obtener Póliza de Pago</button>`,
                          didRender: () => {
                            const btn = document.getElementById('btn-poliza');
                            if (btn) {
                              btn.addEventListener('click', () => {
                                this.getPoliza(resp.poliza.lineaCaptura);
                              });
                            }
                          }
                          //text: "Para validar su trámite conserve la linea de captura y consulte en linea su póliza: " + resp.poliza.lineaCaptura,
                        }).then((result) => {
                          if (result.isConfirmed) {
                            sessionStorage.setItem('datos_poliza', JSON.stringify(resp.poliza));
                            this.router.navigate(['pagos/generar_poliza']);
                            /* Carlos A. 08/04/2026 - Descomentar esta línea y comentar la anterior, implementación de la nueva pasarela de pagos*/
                            //this.router.navigate(['pagos/pasarela-pagos']);
                            return;
                          } else {
                            this.router.navigate(['pagos/dependencias']);
                            return;
                          }
                        });
                    },
                    error: (err) => {
                      Swal.fire({
                        icon: "error",
                        title: "Error !!!!",
                        text: "Problema al processar su solicitud, favor de contactar a Servicio Técnico",
                        showConfirmButton: false,
                        timer: 2500
                      });
                    }
                  });
                  if (datos.tiene_exencion?.toLowerCase() == '1') {
                    this.router.navigate(['pagos/dependencias']);
                    return;
                  }
                  //return;
                } else {
                  sessionStorage.setItem('datos_poliza', JSON.stringify(resp.poliza));
                  this.router.navigate(['pagos/generar_poliza']);
                  /* Carlos A. 08/04/2026 - Descomentar esta línea y comentar la anterior, implementación de la nueva pasarela de pagos*/
                  //this.router.navigate(['pagos/pasarela-pagos']);
                  return;
                }
              } else {
                sessionStorage.setItem('datos_poliza', JSON.stringify(resp.poliza));
                this.router.navigate(['pagos/generar_poliza']);
                /* Carlos A. 08/04/2026 - Descomentar esta línea y comentar la anterior, implementación de la nueva pasarela de pagos*/
                //this.router.navigate(['pagos/pasarela-pagos']);
                return;
              }

            }
            this.openSnackBar(resp.data!);
            return;
          });
        clearInterval(id);
      }
      //console.log('continua la la espera')
    }, 150)
  }
  generarPoliza(): void {

    if (this.myFormContribuyente.invalid) {
      this.myFormContribuyente.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }
    this.generarPoliza_response();
    /*let nombreCompleto = String(this.myFormContribuyente.get('nombre')?.value).toUpperCase() + ' ' + String(this.myFormContribuyente.get('primerApellido')?.value).toUpperCase() + ' ' + String(this.myFormContribuyente.get('segundoApellido')?.value).toUpperCase();
    this.serviciosGenerales.polizaExistente(nombreCompleto, Number(this.contribuyenteArr.data.total))
      .subscribe({
        next: (resp) => {
          if (resp?.success && typeof resp.data === 'object') {
            Swal.fire(
              {
                title: "Concepto Pagado con Anterioridad !!",
                html: `${resp.message}. Desea Continuar con el proceso de pago?`,
                showDenyButton: true,
                confirmButtonText: "Continuar",
                denyButtonText: `Cancelar`
              }).then((result) => {
                if (result.isConfirmed) {
                  this.generarPoliza_response();
                } else if (result.isDenied) {
                  this.router.navigate(['pagos/dependencias']);
                  return;
                }
              });
          } else {
            this.generarPoliza_response();
          }
        },
        error: (err) => {
          this.openSnackBar('Error al validar póliza existente, favor de intentar nuevamente');
        },
        complete: () => {}
      });*/
  }

  getPoliza(lineaCaptura: string) {
    window.open(`${this.url}${lineaCaptura}`);
  }

  isValidField(field: string) {

  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message, duration: 4000, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
    });
  }


}
