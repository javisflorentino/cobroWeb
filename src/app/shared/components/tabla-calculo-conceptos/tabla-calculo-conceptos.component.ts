import { Component, OnInit, OnDestroy, AfterContentInit, inject } from '@angular/core';
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

@Component({
  selector: 'shared-tabla-calculo-conceptos',
  templateUrl: './tabla-calculo-conceptos.component.html',
  styleUrls: ['./tabla-calculo-conceptos.component.css']
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
  public idConcepto: number = 0;
  /* ruta desde donde se origino la peticion, se almacena en LocalStorage */
  public route_origen: string = 'dependencias';

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
    localStorage.removeItem('contribuyente');
  }

  ngOnDestroy() {
    //localStorage.removeItem('route_origen');
    console.log('Destroy TABLA-CALCULO');
    this.destroyed.next();
    this.destroyed.complete();
    this.activatedRoute.params.subscribe().unsubscribe();
  }

  ngOnInit(): void {

    if (localStorage.getItem('route_origen'))
      this.route_origen = localStorage.getItem('route_origen')!;

    this.isLoading = true;
    if (!localStorage.getItem('vehicle_data')) {
      const idConcepto = Number.parseInt(localStorage.getItem('idConcepto')!);
      if (idConcepto && idConcepto !== 0) {
        this.consultConceptoPago(idConcepto, 1)
        return;
      }

      this.activatedRoute.params.subscribe(({ idConcepto, tipoForm }) => {
        this.tipoform = tipoForm;
        this.idConcepto = idConcepto;
        this.arrConceptos.push(idConcepto);

        const datos = JSON.parse(localStorage.getItem('datos_cobro')!);
        switch (Number(this.tipoform)) {
          case 0: case 1: case 7:
            this.tipoFormEdit = true;
            if (this.tipoform == 0) this.tipoFormEdit = false;
            this.openSnackBar('La cantidad inicial es 1. Si desea agregar mas, cambie el valor en el campo cantidad.');
            this.consultConceptoPago(idConcepto, 1, this.tipoform);
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
                    if (localStorage.getItem('contribuyente')) {
                      let contribuyente: TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
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
                      localStorage.setItem('contribuyente', JSON.stringify(contribuyente));
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
          case 16: case 14: case 17: case 6: case 12: case 3:
            this.consultConceptoPago(idConcepto, 1, datos.monto);
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

    const dataVehicleLs: DatosTramite = JSON.parse(localStorage.getItem('vehicle_data')!);
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

                localStorage.setItem('contribuyente', JSON.stringify(localServContribuyente));
                return;
              });
          }*/
          localStorage.setItem('contribuyente', JSON.stringify(result));
          return;
        }
        this.openSnackBar('EL TRÁMITE YA SE HA REALIZADO');
        setTimeout(() => {
          this.router.navigate(['pagos/dependencias']);
        }, 2000)

      });
  }

  onAddElementForm() {
    if (this.newElementForm.invalid) return;

    const newGame = this.newElementForm.value
    this.cantidadPago.push(
      this.fb.control(newGame)
    );

  }
  /** SOAP Actualizar */
  consultConceptoPagoISAN(idConcepto: number) {
    const datos = JSON.parse(localStorage.getItem('datos_cobro')!);


    this.generalesService.getDetalleCobroISAN(datos.monto, datos.fechaVencimiento, 927)
      .then(response => response.text())
      .then(xml => {
        this.isLoading = false;
        this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
        let adeudos = this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse'].adeudos;
        this.conceptos = [{
          id: 0,
          clave: String(adeudos['claveConcepto']['#text']),
          cantidad: 1,
          descripcion: String(adeudos['descripcion']['#text']),
          ejercicioFiscal: Number(adeudos['ejercicioFiscal']['#text']),
          importe: Number(adeudos['importe']['#text'])
        }];
        localStorage.setItem('contribuyente', JSON.stringify({ data: { total: Number(adeudos['total']['#text']), conceptos: this.conceptos, lineaDetalle: String(adeudos['lineaDetalle']['#text']) }, success: true }));//this.conceptoPago));
        this.total += Number(adeudos['total']['#text']);
      }).catch(err => console.log(err));

  }
  consultConceptoPago(idConcepto: number, cantidad: number, monto?: number) {
    monto = (monto == 0) ? 1 : monto;
    //Si esta definido el Local-Stor, y dependiendo de los conceptos se agregan los elementos al form
    if (localStorage.getItem('contribuyente') && (this.tipoFormEdit || this.tipoFormEdit_hoja)) {
      let LocalS: TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
      Object.keys(LocalS.data.conceptos).forEach((k, v) => {
        this.onAddElementForm();
      });
    } else {
      this.onAddElementForm();
    }


    this.isLoading = true;
    const datos = {
      "idConcepto": idConcepto,
      "monto": (monto) ? monto : null,
      "cantidad": cantidad
    };

    if (localStorage.getItem('contribuyente')) {//&& this.tipoFormEdit) {
      let contribuyente: TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
      if(contribuyente.data.conceptos.find(resp => resp.conceptoArea == idConcepto) !== undefined) {
        this.isLoading = false;
        return;
      }
    }

    this.smyPagosService.otherCalculoPagos(datos)
      .subscribe(resp => {
        this.isLoading = false

        if (resp.success && resp.data.conceptos.length > 0) {
          if (localStorage.getItem('contribuyente')) {//&& this.tipoFormEdit) {
            let contribuyente: TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
            contribuyente.data.conceptos.push(resp.data.conceptos[0]);//concat(resp.data.conceptos);
            contribuyente.data.total += resp.data.total;
            contribuyente.data.lineaDetalle = contribuyente.data.lineaDetalle + resp.data.lineaDetalle;
            localStorage.setItem('contribuyente', JSON.stringify(contribuyente));
            this.conceptos = contribuyente.data.conceptos;
            if (this.total === 0) {
              this.total = contribuyente.data.total;
              return;
            }
            this.total += resp.data.total;
            return;
          }
          this.conceptos = resp.data.conceptos;
          localStorage.setItem('contribuyente', JSON.stringify(resp));//this.conceptoPago));
          this.total += resp.data.total;
          if (this.generalService.conceptoStorage.filter(resp => resp.idConcepto === Number(idConcepto) && resp.combinable == 1).length > 0) {
            setTimeout(() => {
              this.openSnackBar('Para agregagar otro concepto, seleccionelo en el menu lateral');
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

  getTotalCost() {
    return this.conceptos.map(t => t.importe).reduce((acc, value) => acc + value, 0);
  }
  /* Recibe el objeto que contiene los valores del renglos seleccionado */
  selectRow(event: any) {
    this.selectedRowIndex = event.id;
  }
  datosContribuyente(): void {
    if (localStorage.getItem('idParent')) {
      let contribuyente: TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
      contribuyente.data.total = this.total;
      localStorage.setItem('contribuyente', JSON.stringify(contribuyente));
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
    /** SOAP */
    this.total = 0;
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

        localStorage.setItem('contribuyente', JSON.stringify({ data: { total: monto, conceptos: this.conceptos, lineaDetalle: lineaDetalle.slice(0, lineaDetalle.length - 1) }, success: true }));
        this.total = Number(monto);
      });
  }
  /*
   SE INVOCA AL CAMBIAR EN LA TABLA EL CAMPO CANTIDAD O No DE HOJA
  */
  sendCant(val: any): void {
    if (this.tipoform == 8) {
      this.sendNoHoja();
      return;
    }

    let contribuyente: TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
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
      if (this.conceptos.length == 0) {
        this.router.navigate(['/pagos/dependencias']);
      }
      this.arrConceptos.splice(val, 1);//push(idConcepto);
      localStorage.setItem('contribuyente', JSON.stringify(contribuyente));
      return
    }
    this.isLoading = true;
    this.generalesService.getConceptoDetalleRest(this.arrConceptos[val], this.cantidadPago.controls[val].value)//this.idConcepto,this.cantidadPago.controls[key].value)
      .subscribe({
        next: (resp) => {
          if (!resp) {
            this.openSnackBar('Problema con el API-SERVER, favor de reportarlo al CAT e intentarlo mas tarde');
            return;
          }

          let arrLineaDetalle = contribuyente.data.lineaDetalle.split('|');
          arrLineaDetalle.pop();
          arrLineaDetalle[val] = resp.data.lineaDetalle;

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
          localStorage.setItem('contribuyente', JSON.stringify(contribuyente));
        }
      });




  }
}
