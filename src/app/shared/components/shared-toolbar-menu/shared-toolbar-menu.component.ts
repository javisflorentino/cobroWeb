import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ModalComprobantePagoComponent } from '../modal-comprobante-pago/modal-comprobante-pago.component';
import { ModalPagoLineaComponent } from '../modal-pago-linea/modal-pago-linea.component';
import { ModalHistoricoPagosComponent } from '../modal-historico-pagos/modal-historico-pagos.component';
import { ModalFacturacionComponent } from '../modal-facturacion/modal-facturacion.component';

@Component({
  selector: 'shared-toolbar-menu',
  templateUrl: './shared-toolbar-menu.component.html',
  styleUrls: ['./shared-toolbar-menu.component.css']
})
export class SharedToolbarMenuComponent {

  show = false;

  menuButtons = [
    { icon: 'receipt_long', label: 'Recibo de Pago' },
    { icon: 'request_quote', label: 'Facturación' },
    { icon: 'history', label: 'Histórico' },
    { icon: 'payments', label: 'Pagar Póliza' }
  ];

  constructor(private dialog: MatDialog){}

  openDialog(button: any): void {
    // Solo abrimos el diálogo si es el botón de "Pagar Póliza"
    if (button.label === 'Pagar Póliza') {
      const dialogRef = this.dialog.open(ModalPagoLineaComponent, {
        width: '350px',
        disableClose: false,

      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Datos del formulario:', result);
          // Aquí puedes manejar los datos recibidos del diálogo
        }
      });
    }
    if (button.label === 'Recibo de Pago') {
      const dialogRef = this.dialog.open(ModalComprobantePagoComponent, {
        width: '350px',
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Datos del formulario:', result);
          // Aquí puedes manejar los datos recibidos del diálogo
        }
      });
    }
    if (button.label === 'Histórico') {
      const dialogRef = this.dialog.open(ModalHistoricoPagosComponent, {
        width: '350px',
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Datos del formulario:', result);
          // Aquí puedes manejar los datos recibidos del diálogo
        }
      });
    }
    if (button.label === 'Facturación') {
      const dialogRef = this.dialog.open(ModalFacturacionComponent, {
        width: '550px',
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Datos del formulario:', result);
          // Aquí puedes manejar los datos recibidos del diálogo
        }
      });
    }
  }
}
