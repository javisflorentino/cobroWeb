import { Component, OnInit, OnDestroy } from '@angular/core';
import { SmyCalculoPagosService } from '../../services/smy-calculo-pagos.service';
import { Concepto, Data, TopLevel } from '../../interfaces/calculo-conceptos';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'shared-tabla-calculo-conceptos',
  templateUrl: './tabla-calculo-conceptos.component.html',
  styleUrls: ['./tabla-calculo-conceptos.component.css']
})
export class TablaCalculoConceptosComponent implements OnInit, OnDestroy {
  public displayedColumns = ['descripcion','ejercicioFiscal','importe','cantidad','subtotal'];
  //displayedColumns = ['item', 'cost'];


  public conceptos: Concepto[] = [];

  public total: number = 0;

  public selectedRowIndex = -1;

  private horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  private verticalPosition: MatSnackBarVerticalPosition = 'top';

  private conceptoPago!: TopLevel;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  public tipoform: number = 0;
  public idConcepto: number = 0;

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
      this.destroyed.next();
      this.destroyed.complete();
  }

  ngOnInit(): void {
    this.openSnackBar('La cantidad inicial es 1. Si desea pagar mas de un concepto cambie el valor en cantidad.');

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
        this.consultConceptoPago(idConcepto,1);
      });
    }
    const dataVehicleLs = JSON.parse(localStorage.getItem('vehicle_data')!);
    this.smyPagosService.getCalculoPagos(
      {
        "tramite": 1,
        "placa": dataVehicleLs.placa,
        "numeroSerie": dataVehicleLs.serie,
        "obtenerContribuyente":true
      }
    )
      .subscribe(result => {
        this.isLoading = false;
        console.log(result.data.total);
        this.conceptoPago = result;
        if(result.success && result.data.conceptos.length>0) {
          this.conceptos = result.data.conceptos;
          console.log(this.conceptos)
          this.total = result.data.total;
          /*localStorage.setItem('contribuyente',JSON.stringify([result.data.contribuyente,result.data.domicilio,
            {"lineaDetalle":result.data.lineaDetalle}, {"totalConceptos":result.data.conceptos.length}])
          );*/
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
        this.conceptoPago = resp;
        if(resp.success && resp.data.conceptos.length>0) {
          this.conceptos = resp.data.conceptos;
          localStorage.setItem('contribuyente',JSON.stringify(this.conceptoPago));
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
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3500
    });
  }

  getTotalCost() {
    return this.conceptos.map(t => t.importe).reduce((acc, value) => acc + value, 0);
  }
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
