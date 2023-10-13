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

/*
https://app.hacienda.morelos.gob.mx/serviciosHacienda/smyt/particular/
WS_SH1 / Hdes22G*_106
{
    "tramite": "1",
    "placa": "PXN4997",
    "numeroSerie": "07992",
    "obtenerContribuyente":true
}
*/

/* cripcion - ejercicio - costo unitario - cantidad - subtotal
		TOTAL
					CONTINUAR -> (DATOS DEL CONTRIBUYENTE Y GENERAR POLIZA) */
  /** Gets the total cost of all transactions. */

  /*
  {
        "tramite": 1,
        "placa":"RBK258A",
        "numeroSerie":"82887",
        "obtenerContribuyente":true
    }
  */
  private conceptoPago!: TopLevel;
  constructor(
    private smyPagosService: SmyCalculoPagosService,
    private router:Router,
    private _snackBar: MatSnackBar,
    ) {}

  ngOnInit(): void {
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
