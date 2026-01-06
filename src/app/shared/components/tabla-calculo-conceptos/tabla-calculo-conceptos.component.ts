import { Component, OnInit, OnDestroy, AfterContentInit, inject, LOCALE_ID } from '@angular/core';
import { SmyCalculoPagosService } from '../../services/smy-calculo-pagos.service';
import { Concepto, TopLevel, Contribuyente, Domicilio } from '../../interfaces/calculo-conceptos';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { DatosTramite } from '../../interfaces/datos-tramite.interface';
import { GeneralesService } from '../../../portal-hacienda/services/generales.service';
import { ConvertXmlString } from '../../clases/convert-xml-string';
import { FechaVencimientoISAN } from '../../interfaces/soap-fechavencimiento-isan';
import { IsanCobros } from '../../interfaces/soap-IsanCobros';
import { environments } from 'src/environments/environments';
import { SoapServiciosConceptosDetalle } from '../../interfaces/soap-servicios_conceptos';
import { estadoVehiculo } from '../../interfaces/soap-estadoVehivulo';
import { MenuService } from '../../services/menu.service';
import Swal from 'sweetalert2';
import { RequestConceptos } from '../../interfaces/request-conceptos.interface';
import localeEs from '@angular/common/locales/es-MX';
import { registerLocaleData } from '@angular/common';
import { SnackBarWhitLinkComponent } from '../snack-bar-whit-link/snack-bar-whit-link.component';
registerLocaleData(localeEs);


@Component({
  selector: 'shared-tabla-calculo-conceptos',
  templateUrl: './tabla-calculo-conceptos.component.html',
  styleUrls: ['./tabla-calculo-conceptos.component.css'],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-MX' }
  ]
})
export class TablaCalculoConceptosComponent implements OnInit, OnDestroy, AfterContentInit {

  /* Controla el nombre de los aributos del objeto obtenido */
  public displayedColumns = ['descripcion', 'ejercicioFiscal', 'importe', 'cantidad', 'subtotal'];
  /* Variable en donde se almacena la consulta y que cumpla con la estructura CONCEPTO */
  public conceptos: Concepto[] = [];
  //public control_hoja: boolean=false;
  /* Controla el valor resultante de la consulta */
  public total: number = 0;
  /* Controla valor del renglon seleccionado */
  public selectedRowIndex = -1;
  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  public tipoform: number = 0;
  public tipoFormEdit: boolean = false;
  public tipoFormEdit_hoja: boolean = false;
  public tipoFormEdit_monto: boolean = false;
  public idConcepto: number = 0;
  /* ruta desde donde se origino la peticion, se almacena en LocalStorage */
  public route_origen: string = 'dependencias';
  private isReposicionLicencia: boolean = false;

  private generalService = inject(MenuService);

  destroyed = new Subject<void>();
  public sizeDisplay!: string;
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  public newElementForm: FormControl = new FormControl('1', [Validators.required]);

  /*get cantidadPago() {
    return this.formTableCal.get('cantidadPago')?.value
  }*/

  public formTableCal: FormGroup = this.fb.group({
    cantidadPago: this.fb.array([])
  });

  get cantidadPago() {
    return this.formTableCal.get('cantidadPago') as FormArray;
  }

  /* Variables SOAP Actualizar o Borrar */
  private asJson!: IsanCobros;
  private asJsonEstadoVehiculo!: estadoVehiculo;
  //private asJsonIsan!: IsanCobros;
  private xmlSring: ConvertXmlString = new ConvertXmlString();

  /*
    NOTA: SE ALAMACENAN LOS CONCEPTOS RECIBIDOS POR LA URL
    MODIF: 12/12/2023
  */
  private arrConceptos: number[] = [];

  constructor(
    private smyPagosService: SmyCalculoPagosService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private generalesService: GeneralesService
  ) {
    this.mediaQuery();
  }
  /*
    NOTA: SE USA CUANDO SE REFRESCA EL NAVEGADAR EVITAR SE SIGAN CARGANDO CONCEPTOS Y REINICIA AL CONCEPTO DE ORIGEN
    MODIF: 12/12/2023
  */
  ngAfterContentInit(): void {
    //sessionStorage.removeItem('contribuyente');
  }

  ngOnDestroy() {
    //sessionStorage.removeItem('route_origen');
    console.log('Destroy TABLA-CALCULO');
    this.destroyed.next();
    this.destroyed.complete();
    this.activatedRoute.params.subscribe().unsubscribe();
  }

  ngOnInit(): void {
    /* NOTA: SE USA CUANDO SE REFRESCA EL NAVEGADAR EVITAR SE SIGAN CARGANDO CONCEPTOS Y REINICIA AL CONCEPTO DE ORIGEN */
    sessionStorage.removeItem('contribuyente');

    if (sessionStorage.getItem('route_origen'))
      this.route_origen = sessionStorage.getItem('route_origen')!;

    this.isLoading = true;
    if (!sessionStorage.getItem('vehicle_data')) {
      const idConcepto = Number.parseInt(sessionStorage.getItem('idConcepto')!);
      if (idConcepto && idConcepto !== 0) {
        this.consultConceptoPago(idConcepto, 1)
        return;
      }

      this.activatedRoute.params.subscribe(({ idConcepto, tipoForm }) => {
        this.tipoform = tipoForm;
        this.idConcepto = idConcepto;

        if (!!!sessionStorage.getItem('contribuyente')) {
          this.arrConceptos[0] = idConcepto;
        } else {
          this.arrConceptos.push(idConcepto);
        }

        if ([843, 842, 844].find(resp => resp == idConcepto) !== undefined) {
          this.openSnackBar('ESTE TRÁMITE SOLO APLICA PARA CASOS DE ROBO O EXTRAVÍO DE LICENCIA Y QUE AÚN TENGAN VIGENCIA.');
          this.isReposicionLicencia = true;
        }

        if ([287].find(resp => resp == idConcepto) !== undefined) {
          //this.openSnackBar('UNA VEZ REALIZADO EL PAGO DEBE CONTINUAR CON SU TRÁMITE EN:\n <a href="https://pagos.hacienda.morelos.gob.mx/#/pagos/dependencias?opc=5" target="_blank">https://pagos.hacienda.morelos.gob.mx/#/pagos/dependencias?opc=5</a>');
          this.openSnackBarWhitLink({
            message: 'UNA VEZ REALIZADO EL PAGO DEBE CONTINUAR CON SU TRÁMITE EN:',
            linkText: 'https://pagos.hacienda.morelos.gob.mx/#/pagos/dependencias?opc=5',
            linkUrl: 'https://pagos.hacienda.morelos.gob.mx/#/pagos/dependencias?opc=5'
          })
          this.isReposicionLicencia = true;
        }

        const datos = JSON.parse(sessionStorage.getItem('datos_cobro')!);
        switch (Number(this.tipoform)) {
          case 0: case 1: case 7:
            if (tipoForm == 7) {
              this.tipoFormEdit_monto = true;
              //this.displayedColumns.pop();
              //this.displayedColumns.push('monto');
            }
            this.tipoFormEdit = true;

            if (this.tipoform == 0) this.tipoFormEdit = false;
            if (!this.isReposicionLicencia) {
              this.openSnackBar('La cantidad inicial es 1. Si desea agregar mas, cambie el valor en el campo cantidad.');
            }
            this.consultConceptoPago(idConcepto, 1, 0);//this.tipoform);
            break;
          case 4:
            this.consultConceptoPagoISAN(this.idConcepto);
            break;
          case 5:
            Object.keys(datos).forEach(r => {
              if (datos[r] > 0 && r !== 'cantidad') {
                if (r === 'monto') {
                  this.consultConceptoPago(idConcepto, 1, datos[r]);//this.consultConceptoPago((r=='actualizacion' || r=='recargo'?651:idConcepto),1,datos[r]);
                } else {
                  let control: boolean = true;
                  let id = setInterval(() => {
                    if (sessionStorage.getItem('contribuyente')) {
                      let contribuyente: TopLevel = JSON.parse(sessionStorage.getItem('contribuyente')!);
                      contribuyente.data.conceptos.push(
                        {
                          id: 0,
                          clave: '0637',
                          cantidad: 1,
                          descripcion: (r == 'actualizacion' ? 'ACTUALIZACION ' : 'RECARGO ') + contribuyente.data.conceptos[0].descripcion,
                          ejercicioFiscal: contribuyente.data.conceptos[0].ejercicioFiscal, importe: datos[r],
                          importeUnitario: datos[r],
                        }
                      );
                      contribuyente.data.total += datos[r];
                      contribuyente.data.lineaDetalle += '0637' + '¬¬' + '1' + '¬' + (r == 'actualizacion' ? 'ACTUALIZACION ' : 'RECARGO ') + ' ' + contribuyente.data.conceptos[0].descripcion + '¬' + contribuyente.data.conceptos[0].ejercicioFiscal + '¬' + datos[r] + '¬' + '0637¬|';
                      sessionStorage.setItem('contribuyente', JSON.stringify(contribuyente));
                      this.conceptos = contribuyente.data.conceptos;
                      this.total += datos[r];
                      clearInterval(id);
                    }
                  }, 150)
                }
              }
            });
            break;
          case 8:
            this.tipoFormEdit_hoja = true;
            this.displayedColumns.pop();
            this.displayedColumns.push('no_hojas');
            this.displayedColumns.push('subtotal');
            this.openSnackBar('El No de Hojas es 1. Si desea agregar mas, cambie el valor en el campo No Hojas.');
            this.consultConceptoPago(idConcepto, 1, this.tipoform);
            break;
          case 13:
            this.consultConceptoPago(idConcepto, 1, this.tipoform);
            break;
          case 16: case 14: case 17: case 3: case 18://case 16: case 14: case 17: case 6: case 12: case 3:
            this.consultConceptoPago(idConcepto, 1, datos.monto);
            break;
          case 12:
            this.consultConceptoPago(idConcepto, datos.cantidad, datos.monto);
            break;
          case 6:
            //this.consultaRezagosActualizacionAdicional(idConcepto);
            this.consultConceptoPago(idConcepto, 1, datos.monto);
            break;
          case 9:
            this.consultConceptoPagoImpuestoCedular(this.idConcepto);
            break;
          default:
            if (!this.tipoform) {
              this.consultConceptoPago(idConcepto, 1, this.tipoform);
            }
            break;
        }
      });
      return;
    }

    const dataVehicleLs: DatosTramite = JSON.parse(sessionStorage.getItem('vehicle_data')!);
    /* TODO: Carlos A 17/07/2025  se agrego dataVehicleLs.tramite == 3*/
    if ((dataVehicleLs.tramite == 9 || (dataVehicleLs.tramite == 3 && !!dataVehicleLs.numeroConcesion) || (dataVehicleLs.tramite == 1 && !!dataVehicleLs.numeroConcesion)) && dataVehicleLs.valorVenta == null) {
      this.smyPagosService.getCalculoPagosPublico(dataVehicleLs)
        .subscribe(result => {
          this.isLoading = false;
          if (result.success && result.data.conceptos.length > 0) {
            this.conceptos = result.data.conceptos;
            this.total += result.data.total;


            sessionStorage.setItem('contribuyente', JSON.stringify(result));
            return;
          }
          this.openSnackBar('EL TRÁMITE YA SE HA REALIZADO');
          setTimeout(() => {
            this.router.navigate(['pagos/dependencias']);
          }, 2000)

        });
    } else {

      this.smyPagosService.getCalculoPagos(dataVehicleLs)
        .subscribe(result => {
          this.isLoading = false;
          if (result.success && result.data.conceptos.length > 0) {
            this.conceptos = result.data.conceptos;
            this.total += result.data.total;

            /*if (!result.data.contribuyente) {
              // SOAP obtener datos del Contribuyente
              let datosContibuyente;
              let datosContibuyenteDomicilio;
              let contribuyente: Contribuyente = {} as Contribuyente;
              let contribuyenteDomicilio: Domicilio = {} as Domicilio;
              let localServContribuyente: TopLevel = result;

              this.smyPagosService.getTaxpayData(dataVehicleLs)
                .then(response => response.text())
                .then(xml => {
                  this.asJsonEstadoVehiculo = this.xmlSring.xmlStringToJson(xml.toString());
                  datosContibuyente = this.asJsonEstadoVehiculo['soap:Envelope']['soap:Body']['ns2:obtenEstatusVehiculoResponse'].estatusVehiculo.propietario;
                  datosContibuyenteDomicilio = this.asJsonEstadoVehiculo['soap:Envelope']['soap:Body']['ns2:obtenEstatusVehiculoResponse'].estatusVehiculo.domicilio;

                  contribuyente.nombre = String(datosContibuyente.nombre['#text']);
                  contribuyente.primerApellido = String(datosContibuyente.apellidoPaterno['#text']);
                  contribuyente.segundoApellido = String(datosContibuyente.apellidoMaterno['#text']);
                  contribuyente.rfc = String(datosContibuyente.rfc['#text']);
                  contribuyente.tipoPersona = String((datosContibuyente.tipoPersona['#text']?.includes('Fisica')) ? 'F' : 'M');
                  contribuyente.curp = '';
                  contribuyente.id = Number(datosContibuyente.idContribuyente['#text']);

                  contribuyenteDomicilio.calle = String(datosContibuyenteDomicilio.nombreVialidad['#text']);
                  contribuyenteDomicilio.codigoPostal = String(datosContibuyenteDomicilio.codigoPostal['#text']);
                  contribuyenteDomicilio.colonia = String(datosContibuyenteDomicilio.nombreAsentamiento['#text']);
                  contribuyenteDomicilio.estado = '';
                  contribuyenteDomicilio.municipio = '';
                  contribuyenteDomicilio.numeroExterior = String(datosContibuyenteDomicilio.numeroExterior['#text']);
                  contribuyenteDomicilio.numeroInterior = '';

                  localServContribuyente.data.contribuyente = contribuyente;
                  localServContribuyente.data.domicilio = contribuyenteDomicilio;

                  sessionStorage.setItem('contribuyente', JSON.stringify(localServContribuyente));
                  return;
                });
            }*/
            sessionStorage.setItem('contribuyente', JSON.stringify(result));
            return;
          }
          this.openSnackBar('EL TRÁMITE YA SE HA REALIZADO');
          setTimeout(() => {
            this.router.navigate(['pagos/dependencias']);
          }, 2000)

        });
    }
  }

  onAddElementForm() {
    if (this.newElementForm.invalid) return;

    const newGame = this.newElementForm.setValue(1);//value
    this.cantidadPago.push(
      this.fb.control(1)
    );

  }

  consultaRezagosActualizacionAdicional(idConcepto: number) {
    const datos_cobro = JSON.parse(sessionStorage.getItem('datos_cobro')!);
    let conceptos: Concepto = {} as Concepto;
    this.generalesService.getRezagosActualizaciones(idConcepto, datos_cobro.monto, datos_cobro.fecha)
      .then(response => response.text())
      .then(xml => {
        this.isLoading = false;
        this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
        if (!!this.asJson) {
          const response = this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse']['adeudos']['descripcion']['#text']; //estatusVehiculo.vehiculo.noSerie['#text'];

          conceptos.descripcion = this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse']['adeudos']['descripcion']['#text'];
          conceptos.ejercicioFiscal = Number(this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse']['adeudos']['ejercicioFiscal']['#text']);
          conceptos.importeUnitario = Number(this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse']['adeudos']['total']['#text']);
          conceptos.cantidad = 1;
          conceptos.importe = Number(this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse']['adeudos']['total']['#text']);

          this.conceptos = [conceptos];//.push(conceptos);

          sessionStorage.setItem('contribuyente', JSON.stringify({ data: { total: Number(this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse']['adeudos']['total']['#text']), conceptos: this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse']['adeudos']['descripcion']['#text'], lineaDetalle: String(this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse']['adeudos']['lineaDetalle']['#text']) }, success: true }));//this.conceptoPago));
          this.total += Number(this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse']['adeudos']['total']['#text']);
          datos_cobro.concepto = this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse']['adeudos']['descripcion']['#text'];
          sessionStorage.setItem('datos_cobro', JSON.stringify(datos_cobro));
          return;
        } else {
          throw { message: "No se obtuvo informacion con los datos proporcionados", error: "Unauthorized", statusCode: 412 };
        }
      })
      .catch(err => {
        console.log('ERROR')
        this.isLoading = false;
        Swal.fire({ icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}`, allowOutsideClick: false })
          .then(() => {
            this.router.navigate(['pagos/dependencias']);
          });
      })
  }

  /** SOAP Actualizar */
  consultConceptoPagoISAN(idConcepto: number) {
    const datos = JSON.parse(sessionStorage.getItem('datos_cobro')!);
    this.generalesService.getDetalleCobroISAN(datos.monto, datos.ejercicio, datos.periodo, 927)
      .subscribe({
        next: (resp) => {
          this.isLoading = false;
          this.conceptos = resp!.data.conceptos;
          sessionStorage.setItem('contribuyente', JSON.stringify({ data: { total: Number(resp!.data.total), conceptos: this.conceptos, lineaDetalle: String(resp!.data.lineaDetalle), observaciones: String(resp?.data.observaciones) }, success: true }));//this.conceptoPago));
          this.total += Number(resp!.data.total);
          datos.concepto = resp?.data.conceptos[0].descripcion;
          sessionStorage.setItem('datos_cobro', JSON.stringify(datos));
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({ title: "Error !!", text: err.message, icon: "error", allowOutsideClick: false })
            .then((response) => {
              this.router.navigate(['pagos/dependencias']);
            });
        }
      })
  }

  consultConceptoPagoImpuestoCedular(idConcepto: number) {
    const datos = JSON.parse(sessionStorage.getItem('datos_cobro')!);
    this.generalesService.getDetalleCobroImpuestoCedular(datos.fecha_enajenacion, datos.base_impuesto, 6673)
      .subscribe({
        next: (resp) => {
          console.log(resp);
          this.isLoading = false;
          this.conceptos = resp!.data.conceptos;
          sessionStorage.setItem('contribuyente', JSON.stringify({ data: { total: Number(resp!.data.total), conceptos: this.conceptos, lineaDetalle: String(resp!.data.lineaDetalle), observaciones: String(resp?.data.observaciones) }, success: true }));//this.conceptoPago));
          this.total += Number(resp!.data.total);
          datos.concepto = resp?.data.conceptos[0].descripcion;
          sessionStorage.setItem('datos_cobro', JSON.stringify(datos));
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({ title: "Error !!", text: err.message, icon: "error", allowOutsideClick: false })
            .then((response) => {
              this.router.navigate(['pagos/dependencias']);
            });
        }
      })
  }

  consultConceptoPago(idConcepto: number, cantidad: number, monto?: number) {
    monto = (monto == 0) ? 1 : monto;
    //Si esta definido el Local-Stor, y dependiendo de los conceptos se agregan los elementos al form
    if (sessionStorage.getItem('contribuyente') && (this.tipoFormEdit || this.tipoFormEdit_hoja)) {
      let LocalS: TopLevel = JSON.parse(sessionStorage.getItem('contribuyente')!);
      Object.keys(LocalS.data.conceptos).forEach((k, v) => {
        this.onAddElementForm();
      });
    } else {
      this.onAddElementForm();
      this.cantidadPago.controls[0].setValue(1);
    }


    this.isLoading = true;
    let datos: RequestConceptos = {
      "idConcepto": idConcepto,
      "monto": (monto) ? monto : null,
      "cantidad": cantidad
    }
    if (idConcepto == 2143) {
      const datos_cobro = JSON.parse(sessionStorage.getItem('datos_cobro')!);
      let fecha_vencimiento: Array<any> = [];
      fecha_vencimiento = String(datos_cobro.fecha).split('-')
      datos.fechaVencimiento = fecha_vencimiento[2] + '-' + fecha_vencimiento[1] + '-' + fecha_vencimiento[0];
    }
    /*const datos = {
      "idConcepto": idConcepto,
      "monto": (monto) ? monto : null,
      "cantidad": cantidad
    };*/

    if (sessionStorage.getItem('contribuyente')) {//&& this.tipoFormEdit) {
      let contribuyente: TopLevel = JSON.parse(sessionStorage.getItem('contribuyente')!);
      if (contribuyente.data.conceptos.find(resp => resp.conceptoArea == idConcepto) !== undefined) {
        this.isLoading = false;
        return;
      }
    }

    this.smyPagosService.otherCalculoPagos(datos)
      .subscribe(resp => {
        this.isLoading = false

        if (resp.success && resp.data.conceptos.length > 0) {
          if (sessionStorage.getItem('contribuyente')) {//&& this.tipoFormEdit) {
            let contribuyente: TopLevel = JSON.parse(sessionStorage.getItem('contribuyente')!);
            contribuyente.data.conceptos.push(resp.data.conceptos[0]);//concat(resp.data.conceptos);
            contribuyente.data.total += resp.data.total;
            contribuyente.data.lineaDetalle = contribuyente.data.lineaDetalle + resp.data.lineaDetalle;
            sessionStorage.setItem('contribuyente', JSON.stringify(contribuyente));
            this.conceptos = contribuyente.data.conceptos;
            /*if (this.total === 0) {
              this.total = contribuyente.data.total;
              return;
            }
            this.total += resp.data.total;*/
            this.total = contribuyente.data.total;
            return;
          }
          this.conceptos = resp.data.conceptos;
          sessionStorage.setItem('contribuyente', JSON.stringify(resp));//this.conceptoPago));
          this.total = resp.data.total;//this.total += resp.data.total;
          if (this.generalService.conceptoStorage.filter(resp => resp.idConcepto === Number(idConcepto) && resp.combinable == 1).length > 0) {
            setTimeout(() => {
              this.openSnackBar('Para agregar otro concepto, seleccionelo en el menu lateral');
            }, 3000)
          }

          return;
        }
        this.openSnackBar(resp.mensaje!);//'EL TRÁMITE YA SE HA REALIZADO');
        setTimeout(() => {
          this.router.navigate(['pagos/dependencias']);
        }, 2000)
      });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message, duration: 5500, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
    });
  }

  openSnackBarWhitLink({ message, linkText, linkUrl }: { message: string; linkText: string; linkUrl: string }) {
    this._snackBar.openFromComponent(SnackBarWhitLinkComponent, {
      data: { message, linkText, linkUrl }, // 👈 aquí va el objeto completo
      duration: 5500,
      panelClass: ["snack-notification"],
      horizontalPosition: "center",
      verticalPosition: "top"
    });
  }

  getTotalCost() {
    return this.conceptos.map(t => t.importe).reduce((acc, value) => acc + value, 0);
  }
  /* Recibe el objeto que contiene los valores del renglos seleccionado */
  selectRow(event: any) {
    this.selectedRowIndex = event.id;
  }
  datosContribuyente(): void {
    if (sessionStorage.getItem('idParent')) {
      let contribuyente: TopLevel = JSON.parse(sessionStorage.getItem('contribuyente')!);
      contribuyente.data.total = this.total;
      sessionStorage.setItem('contribuyente', JSON.stringify(contribuyente));
    }
    this.router.navigate(['pagos/datos-contribuyente']);
  }

  public mediaQuery() {

    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.sizeDisplay = this.displayNameMap.get(query) ?? 'Unknown';
          }
        }
      });


  }
  sendNoHoja() {

    this.isLoading = true;
    const totalHojas = this.cantidadPago.controls[0].value;
    let idConcepto = this.idConcepto;

    this.generalesService.getConceptoDetallebyForm(idConcepto, totalHojas, 'sh-form-6', 'sh-input-cantidad')
      .subscribe(resp => {
        let lineaDetalle: string = '';
        this.isLoading = false;
        this.conceptos = [{
          id: 0,
          clave: String(resp?.data.conceptos[0].clave),
          cantidad: 1,
          descripcion: String(resp?.data.conceptos[0].descripcion),
          ejercicioFiscal: Number(resp?.data.conceptos[0].ejercicioFiscal),
          importe: Number(resp?.data.conceptos[0].importe)
        }];
        resp?.data.lineaDetalle.split('¬').forEach((k, v) => {
          if (v == 5) {
            lineaDetalle += Number(resp?.data.conceptos[0].importe) + '¬';
          } else {
            lineaDetalle += k + '¬';
          }
        });

        sessionStorage.setItem('contribuyente', JSON.stringify({ data: { total: Number(resp?.data.conceptos[0].importe), conceptos: this.conceptos, lineaDetalle: lineaDetalle.slice(0, lineaDetalle.length - 1) }, success: true }));
        this.total = Number(Number(resp?.data.conceptos[0].importe));
      });
    /** SOAP */
    /*this.total = 0;
    this.isLoading = true;
    const totalHojas = this.cantidadPago.controls[0].value;
    let idConcepto = this.idConcepto;
    let monto = environments.valor_uma;
    let asJson: SoapServiciosConceptosDetalle;
    if (totalHojas == 1) {
      idConcepto = 4023;//1416;
    }
    if (totalHojas >= 2 && totalHojas <= 50) {
      idConcepto = 4021;
      monto = environments.valor_uma + ((totalHojas - 1) * (monto * 0.15));
    }
    if (totalHojas > 50) {
      idConcepto = 4022;
      monto = environments.valor_uma + ((environments.valor_uma * 0.15) * 49) + ((totalHojas - 50) * (monto * 0.15));
    }

    this.generalesService.getConceptoDetalleRest(idConcepto, totalHojas)
      .subscribe(resp => {
        let lineaDetalle: string = '';
        this.isLoading = false;
        this.conceptos = [{
          id: 0,
          clave: String(resp?.data.conceptos[0].clave),
          cantidad: 1,
          descripcion: String(resp?.data.conceptos[0].descripcion),
          ejercicioFiscal: Number(resp?.data.conceptos[0].ejercicioFiscal),
          importe: Math.round(monto)//Number(resp?.data.conceptos[0].importe)
        }];
        resp?.data.lineaDetalle.split('¬').forEach((k, v) => {
          if (v == 5) {
            lineaDetalle += monto + '¬';
          } else {
            lineaDetalle += k + '¬';
          }
        });

        sessionStorage.setItem('contribuyente', JSON.stringify({ data: { total: monto, conceptos: this.conceptos, lineaDetalle: lineaDetalle.slice(0, lineaDetalle.length - 1) }, success: true }));
        this.total = Number(monto);
      });*/
  }
  /*
   SE INVOCA AL CAMBIAR EN LA TABLA EL CAMPO CANTIDAD O No DE HOJA
  */
  sendCant(val: any): void {
    if (this.tipoform == 8) {
      this.sendNoHoja();
      return;
    }

    /*if(this.cantidadPago.controls[val].value>50 && this.arrConceptos[val]==436){
      console.log('VALOR HASTA 50::'+ this.arrConceptos[val])
      this.cantidadPago.controls[val].setValue(1)
    }

    if(this.cantidadPago.controls[val].value<51 && this.arrConceptos[val]==437){
      console.log('VALOR HASTA 50::'+ this.arrConceptos[val])
      this.cantidadPago.controls[val].setValue(51)
    }*/

    let contribuyente: TopLevel = JSON.parse(sessionStorage.getItem('contribuyente')!);
    this.total = 0;
    let lineDetalle: string = '';
    let keyDel: number = 0;
    let flagKey: boolean = false;
    //contribuyente.data.lineaDetalle = '';
    if (Number(this.cantidadPago.controls[val].value) == 0) {
      contribuyente.data.conceptos.splice(val, 1);
      contribuyente.data.conceptos.forEach(({ importe }) => {
        this.total += importe;
      });
      this.cantidadPago.removeAt(val);
      contribuyente.data.total = this.total;
      this.conceptos = contribuyente.data.conceptos;

      let arrLineaDetalle = contribuyente.data.lineaDetalle.split('|');
      arrLineaDetalle.splice(val, 1)
      contribuyente.data.lineaDetalle = arrLineaDetalle.join('|');

      if (this.conceptos.length == 0) {
        this.router.navigate(['/pagos/dependencias']);
      }
      this.arrConceptos.splice(val, 1);//push(idConcepto);
      sessionStorage.setItem('contribuyente', JSON.stringify(contribuyente));
      return
    }
    this.isLoading = true;
    let cantida: number = 1;
    let monto: number = 1;
    if (Number(this.tipoform) !== 7) {
      cantida = this.cantidadPago.controls[val].value;
    } else {
      monto = this.cantidadPago.controls[val].value;
    }

    this.generalesService.getConceptoDetalleRest(this.arrConceptos[val], cantida, monto)//this.cantidadPago.controls[val].value)//this.idConcepto,this.cantidadPago.controls[key].value)
      .subscribe({
        next: (resp) => {
          if (!resp) {
            this.openSnackBar('Problema con el API-SERVER, favor de reportarlo al CAT e intentarlo mas tarde');
            return;
          }

          let arrLineaDetalle = contribuyente.data.lineaDetalle.split('|');
          if (arrLineaDetalle[arrLineaDetalle.length - 1].length > 1) arrLineaDetalle.pop();
          arrLineaDetalle[val] = resp.data.lineaDetalle.replaceAll('|', '');

          contribuyente.data.conceptos[val].importe = resp.data.conceptos[0].importe;
          contribuyente.data.conceptos[val].cantidad = resp.data.conceptos[0].cantidad;
          contribuyente.data.lineaDetalle = arrLineaDetalle.join('|');//+= resp.data.lineaDetalle;
          //this.total += Number(resp.data.total);

          this.conceptos = contribuyente.data.conceptos;
        },
        complete: () => {
          this.isLoading = false;
          contribuyente.data.conceptos.forEach(({ importe }) => {
            this.total += importe;
          });
          contribuyente.data.total = this.total;
          sessionStorage.setItem('contribuyente', JSON.stringify(contribuyente));
        }
      });




  }
}
