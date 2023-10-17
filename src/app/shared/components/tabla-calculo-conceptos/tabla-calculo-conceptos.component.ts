import { Component, OnInit } from '@angular/core';
import { SmyCalculoPagosService } from '../../services/smy-calculo-pagos.service';
import { Concepto, Data, TopLevel } from '../../interfaces/calculo-conceptos';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';


@Component({
  selector: 'shared-tabla-calculo-conceptos',
  templateUrl: './tabla-calculo-conceptos.component.html',
  styleUrls: ['./tabla-calculo-conceptos.component.css']
})
export class TablaCalculoConceptosComponent implements OnInit {
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

  constructor(
    private smyPagosService: SmyCalculoPagosService,
    private router:Router,
    private _snackBar: MatSnackBar,
    ) {}

  ngOnInit(): void {
    this.isLoading = true;
    if ( !localStorage.getItem('vehicle_data') ) {
      const idConcepto = localStorage.getItem('idConcepto');
      if ( idConcepto  && idConcepto !== "0" ) {
        this.consultConceptoPago(idConcepto)
      }
      return;
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

  consultConceptoPago(idConcepto:string) {
    const datos = {
      "idConcepto": idConcepto,
      "monto": null,
      "cantidad": 1
    };
    this.smyPagosService.otherCalculoPagos(datos)
      .subscribe(resp => {
        this.isLoading = false
        this.conceptoPago = resp;
        if(resp.success && resp.data.conceptos.length>0) {
          this.conceptos = resp.data.conceptos;
          console.log(this.conceptos)
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
      duration: 2500
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
    this.router.navigate(['pagos/datos-contribuyente']);
  }
}
