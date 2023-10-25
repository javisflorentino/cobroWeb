import { Component, OnInit, OnDestroy } from '@angular/core';
import { SmyCalculoPagosService } from '../../services/smy-calculo-pagos.service';
import { Concepto, TopLevel } from '../../interfaces/calculo-conceptos';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';


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

  get cantidadPago() {
    return this.formTableCal.get('cantidadPago')?.value
  }

  public formTableCal: FormGroup = this.fb.group({
    cantidadPago: [1,[Validators.required]]
  });

  constructor(
    private smyPagosService: SmyCalculoPagosService,
    private router:Router,
    private _snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder
    ) {
      this.mediaQuery();
    }

  ngOnDestroy() {
      localStorage.removeItem('route_origen');
      this.destroyed.next();
      this.destroyed.complete();
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
        console.log(this.tipoform)
        if (this.tipoform == 1 || this.tipoform == 0) {
          this.openSnackBar('La cantidad inicial es 1. Si desea pagar mas de un concepto cambie el valor en cantidad.');
        }
        this.consultConceptoPago(idConcepto,1);
      });
    }
    const dataVehicleLs = JSON.parse(localStorage.getItem('vehicle_data')!);
    this.smyPagosService.getCalculoPagos(
      { "tramite": 1, "placa": dataVehicleLs.placa, "numeroSerie": dataVehicleLs.serie, "obtenerContribuyente":true }
    )
      .subscribe(result => {
        this.isLoading = false;
        console.log(result.data.total);
        //this.conceptoPago = result;
        if(result.success && result.data.conceptos.length>0) {
          this.conceptos = result.data.conceptos;
          console.log(this.conceptos)
          this.total = result.data.total;
          localStorage.setItem('contribuyente',JSON.stringify(result));
          return;
        }
        this.openSnackBar('EL TRÁMITE YA SE HA REALIZADO');
        setTimeout(()=>{
          this.router.navigate(['pagos']);
        },2000)

      });
  }

  consultConceptoPago(idConcepto:number,cantidad:number) {
    this.isLoading = true;
    const datos = {
      "idConcepto": idConcepto,
      "monto": null,
      "cantidad": cantidad
    };
    this.smyPagosService.otherCalculoPagos(datos)
      .subscribe(resp => {
        this.isLoading = false
        //this.conceptoPago = resp;
        if(resp.success && resp.data.conceptos.length>0) {
          this.conceptos = resp.data.conceptos;
          localStorage.setItem('contribuyente',JSON.stringify(resp));//this.conceptoPago));
          this.total = resp.data.total;
          return;
        }
        this.openSnackBar('EL TRÁMITE YA SE HA REALIZADO');
        setTimeout(()=>{
          this.router.navigate(['pagos']);
        },2000)
      });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 3500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }

  getTotalCost() {
    return this.conceptos.map(t => t.importe).reduce((acc, value) => acc + value, 0);
  }
  /* Recibe el objeto que contiene los valores del renglos seleccionado */
  selectRow(event:any) {
    this.selectedRowIndex = event.id;
    console.log(event)
  }
  datosContribuyente():void {
    //if(!localStorage.getItem('contribuyente')) {
    //  localStorage.setItem('contribuyente',JSON.stringify(this.conceptoPago));
    //}
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
          console.log(this.sizeDisplay)
        }
      });


 }
  sendCant(): void {
    console.log(this.cantidadPago);
    this.consultConceptoPago(this.idConcepto,this.cantidadPago);
  }
}
