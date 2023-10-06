import { Component } from '@angular/core';


export interface Transaction {
  item: string;
  cost: number;
}

@Component({
  selector: 'shared-tabla-calculo-conceptos',
  templateUrl: './tabla-calculo-conceptos.component.html',
  styles: [
  ]
})
export class TablaCalculoConceptosComponent {
  displayedColumns = ['item', 'cost'];

  transactions: Transaction[] = [
    {item: 'Beach ball', cost: 4},
    {item: 'Towel', cost: 5},
    {item: 'Frisbee', cost: 2},
    {item: 'Sunscreen', cost: 4},
    {item: 'Cooler', cost: 25},
    {item: 'Swim suit', cost: 15},
  ];
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
  getTotalCost() {
    return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  }
}
