import { Component, OnInit, OnDestroy } from '@angular/core';
import { SmyCalculoPagosService } from '../../services/smy-calculo-pagos.service';
import { Concepto, TopLevel, Contribuyente } from '../../interfaces/calculo-conceptos';
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

@Component({
  selector: 'shared-tabla-calculo-conceptos',
  templateUrl: './tabla-calculo-conceptos.component.html',
  styleUrls: ['./tabla-calculo-conceptos.component.css']
})
export class TablaCalculoConceptosComponent implements OnInit, OnDestroy {

  /* Controla el nombre de los aributos del objeto obtenido */
  public displayedColumns = ['descripcion','ejercicioFiscal','importe','cantidad','subtotal'];
  /* Variable en donde se almacena la consulta y que cumpla con la estructura CONCEPTO */
  public conceptos: Concepto[] = [];
  /* Controla el valor resultante de la consulta */
  public total: number = 0;
  /* Controla valor del renglon seleccionado */
  public selectedRowIndex = -1;
  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  public tipoform: number = 0;
  public tipoFormEdit: boolean = false;
  public idConcepto: number = 0;
  /* ruta desde donde se origino la peticion, se almacena en LocalStorage */
  public route_origen: string = 'dependencias';

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
  private asJson!:FechaVencimientoISAN;
  private xmlSring: ConvertXmlString = new ConvertXmlString();

  constructor(
    private smyPagosService: SmyCalculoPagosService,
    private router:Router,
    private _snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private generalesService:GeneralesService
    ) {
      this.mediaQuery();
    }

  ngOnDestroy() {
      //localStorage.removeItem('route_origen');
      console.log('Destroy TABLA-CALCULO');
      this.destroyed.next();
      this.destroyed.complete();
      this.activatedRoute.params.subscribe().unsubscribe();
  }

  ngOnInit(): void {
    if(localStorage.getItem('route_origen'))
      this.route_origen = localStorage.getItem('route_origen')!;

    this.isLoading = true;
    if ( !localStorage.getItem('vehicle_data') ) {
      const idConcepto = Number.parseInt(localStorage.getItem('idConcepto')!);
      if ( idConcepto  && idConcepto !== 0 ) {
        this.consultConceptoPago(idConcepto,1)
        return;
      }

      this.activatedRoute.params.subscribe(({idConcepto,tipoForm}) => {
        this.tipoform = tipoForm;
        this.idConcepto = idConcepto;

        if (this.tipoform == 1 || this.tipoform == 0) {
          this.tipoFormEdit = true;
          this.openSnackBar('La cantidad inicial es 1. Si desea agregar mas, cambie el valor en el campo cantidad.<br><br>Para agregagar otro concepto, seleccionelo en el menu lateral');
        }
        if (this.tipoform == 13) {
          this.openSnackBar('Para agregagar otro concepto, seleccionelo en el menu lateral');
        }
        if ( this.tipoform == 4) {
          this.consultConceptoPagoISAN(this.idConcepto);
        }
        if ( this.tipoform == 5) {
          const datos = JSON.parse(localStorage.getItem('datos_cobro')!);
          Object.keys(datos).forEach(r => {
            if(datos[r]>0 && r !== 'cantidad')
            {
              if (r === 'monto'){
                this.consultConceptoPago(idConcepto,1,datos[r]);//this.consultConceptoPago((r=='actualizacion' || r=='recargo'?651:idConcepto),1,datos[r]);
              } else {
                let control: boolean = true;
                let id = setInterval(() => {
                  if(localStorage.getItem('contribuyente')) {
                    let contribuyente: TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
                    contribuyente.data.conceptos.push(
                      {
                        id:              0,
                        clave:           '0637',
                        cantidad:        1,
                        descripcion:     (r == 'actualizacion'?'ACTUALIZACIO ':'RECARGO ') + contribuyente.data.conceptos[0].descripcion,
                        ejercicioFiscal: contribuyente.data.conceptos[0].ejercicioFiscal,
                        importe:         datos[r],
                      }
                    );//concat(resp.data.conceptos);
                    //(r == 'actualizacion'?datos[0].actualizacion:datos[0].recargo)
                    contribuyente.data.total += datos[r];
                    contribuyente.data.lineaDetalle = '';
                    localStorage.setItem('contribuyente',JSON.stringify(contribuyente));
                    this.conceptos = contribuyente.data.conceptos;
                    this.total += datos[r];
                    clearInterval(id);
                  }
                },150)
              }
            }
          })
          //this.consultConceptoPago(idConcepto,datos.cantidad,datos.monto);
        } else {
          this.consultConceptoPago(idConcepto,1,this.tipoform);
        }
      });
      return;
    }
    //const dataVehicleLs = JSON.parse(localStorage.getItem('vehicle_data')!);
    const dataVehicleLs: DatosTramite = JSON.parse(localStorage.getItem('vehicle_data')!);
    this.smyPagosService.getCalculoPagos(dataVehicleLs)
      .subscribe(result => {
        this.isLoading = false;
        if(result.success && result.data.conceptos.length>0) {
          this.conceptos = result.data.conceptos;
          this.total += result.data.total;
          localStorage.setItem('contribuyente',JSON.stringify(result));
          return;
        }
        this.openSnackBar('EL TRÁMITE YA SE HA REALIZADO');
        setTimeout(()=>{
          this.router.navigate(['pagos']);
        },2000)

      });
  }

  onAddElementForm() {
    //this.newElementForm
    if ( this.newElementForm.invalid ) return;

    const newGame = this.newElementForm.value
    this.cantidadPago.push(
      this.fb.control( newGame )
    );

    //this.newElementForm.reset();
  }
  /** SOAP Actualizar */
  consultConceptoPagoISAN(idConcepto:number) {
    const datos = JSON.parse(localStorage.getItem('datos_cobro')!);
    console.log(datos);
    let fechaVencimiento: string = '';
    this.generalesService.getFechaVencimientoISAN(Number(datos.periodo),Number(datos.ejercicio))
      .then(response => response.text())
      .then(xml => {
        console.log(this.xmlSring.xmlStringToJson(xml.toString()))
        this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
        fechaVencimiento = this.asJson['soap:Envelope']['soap:Body']['ns2:obtenFechaVencimientoResponse'].fechaVencimiento['#text'].toString();
        this.generalesService.getDetalleCobroISAN(datos.monto,fechaVencimiento,idConcepto)
          .then(resp => resp.text())
          .then(xml_sec => {
            console.log(this.xmlSring.xmlStringToJson(xml_sec.toString()))
          });
      }).catch (err => console.log(err));
  }
  consultConceptoPago(idConcepto:number,cantidad:number,monto?:number) {
    //Si esta definido el Local-Stor, y dependiendo de los conceptos se agregan los elementos al form
      if(localStorage.getItem('contribuyente') && this.tipoFormEdit) {
        let LocalS:TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
        Object.keys(LocalS.data.conceptos).forEach((k,v)=>{
          this.onAddElementForm();
        })
      }else {
        this.onAddElementForm();
      }
      //this.conceptos.forEach((v,k) => console.log('val:' + k))
    //}

    this.isLoading = true;
    const datos = {
      "idConcepto": idConcepto,
      "monto": (monto)?monto:null,
      "cantidad": cantidad
    };
    if( !this.tipoFormEdit )
      localStorage.removeItem('contribuyente');
    this.smyPagosService.otherCalculoPagos(datos)
      .subscribe(resp => {
        this.isLoading = false
        //this.conceptoPago = resp;
        if(resp.success && resp.data.conceptos.length>0) {
          if(localStorage.getItem('contribuyente') ) {//&& this.tipoFormEdit) {
            let contribuyente: TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
            contribuyente.data.conceptos.push(resp.data.conceptos[0]);//concat(resp.data.conceptos);
            contribuyente.data.total += resp.data.total;
            contribuyente.data.lineaDetalle = contribuyente.data.lineaDetalle + resp.data.lineaDetalle;
            localStorage.setItem('contribuyente',JSON.stringify(contribuyente));
            this.conceptos = contribuyente.data.conceptos;
            if (this.total === 0) {
              this.total = contribuyente.data.total;
              return;
            }
            this.total += resp.data.total;
            return;
          }
          this.conceptos = resp.data.conceptos;
          localStorage.setItem('contribuyente',JSON.stringify(resp));//this.conceptoPago));
          this.total += resp.data.total;
          return;
        }
        this.openSnackBar(resp.mensaje!);//'EL TRÁMITE YA SE HA REALIZADO');
        setTimeout(()=>{
          this.router.navigate(['pagos']);
        },2000)
      });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 5500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }

  getTotalCost() {
    return this.conceptos.map(t => t.importe).reduce((acc, value) => acc + value, 0);
  }
  /* Recibe el objeto que contiene los valores del renglos seleccionado */
  selectRow(event:any) {
    this.selectedRowIndex = event.id;
  }
  datosContribuyente():void {
    //if(!localStorage.getItem('contribuyente')) {
    //  localStorage.setItem('contribuyente',JSON.stringify(this.conceptoPago));
    //}
    if(localStorage.getItem('idParent')) {
      let contribuyente: TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
      contribuyente.data.total = this.total;
      localStorage.setItem('contribuyente',JSON.stringify(contribuyente));
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
  sendCant(val:any): void {
    this.total = 0;
    let contribuyente: TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
    let lineDetalle: string = '';
    let keyDel: number = 0;
    let flagKey: boolean = false;

    contribuyente.data.conceptos.forEach(({importe,id},key)=> {
      if(Number.parseInt(this.cantidadPago.controls[key].value) > 0){
      let control: number = 0;

      this.total += importe * this.cantidadPago.controls[key].value;
      //if(control === 1) {
        contribuyente.data.lineaDetalle.split('|').forEach((va,ke) => {
            const val = va.split('¬');

            if ( id === Number.parseInt(val[0]) && va !== '' && control !== Number.parseInt(val[0])) {
              //lineDetalle += va + '|';
              for(let inc = this.cantidadPago.controls[key].value; inc > 0; inc-- ) {
                lineDetalle += va + '|';
              }
            }
            control = Number.parseInt(val[0]);
        });
      } else {
        keyDel = key;
        flagKey = true;
      }
        //control++;
      //}
    });
    if (flagKey) {
      contribuyente.data.conceptos.splice(keyDel,1);
      this.cantidadPago.removeAt(keyDel);
    }
    contribuyente.data.lineaDetalle = lineDetalle;
    contribuyente.data.total = this.total;
    //this.total = contribuyente.data.total * this.cantidadPago.controls[val].value;
    localStorage.setItem('contribuyente',JSON.stringify(contribuyente));
    this.conceptos = contribuyente.data.conceptos;
  }
}
