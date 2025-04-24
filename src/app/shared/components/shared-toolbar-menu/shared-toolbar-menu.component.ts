import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ModalComprobantePagoComponent } from '../modal-comprobante-pago/modal-comprobante-pago.component';
import { ModalPagoLineaComponent } from '../modal-pago-linea/modal-pago-linea.component';
import { ModalHistoricoPagosComponent } from '../modal-historico-pagos/modal-historico-pagos.component';
import { ModalFacturacionComponent } from '../modal-facturacion/modal-facturacion.component';
import { ModalValidarReciboOficioComponent } from '../modal-validar-recibo-oficio/modal-validar-recibo-oficio.component';

@Component({
  selector: 'shared-toolbar-menu',
  templateUrl: './shared-toolbar-menu.component.html',
  styleUrls: ['./shared-toolbar-menu.component.css']
})
export class SharedToolbarMenuComponent {

  show = false;
  @Output()
    private actionOnToolbarMenu = new EventEmitter<boolean>();

  menuButtons = [
    { icon: 'receipt_long', label: 'Recibo de Pago' },
    { icon: 'request_quote', label: 'Facturación' },
    { icon: 'history', label: 'Histórico' },
    { icon: 'payments', label: 'Pagar Póliza' },
    { icon: 'payments', label: 'Oficio de Habilitación' }

  ];

  constructor(private dialog: MatDialog){}

  openDialog(button: any): void {
    // Solo abrimos el diálogo si es el botón de "Pagar Póliza"
    if (button.label === 'Pagar Póliza') {
      const dialogRef = this.dialog.open(ModalPagoLineaComponent, {
        width: '350px',
        disableClose: false,

      });

     
    }
    if (button.label === 'Recibo de Pago') {
      const dialogRef = this.dialog.open(ModalComprobantePagoComponent, {
        width: '350px',
        disableClose: false
      });

      
    }
    if (button.label === 'Histórico') {
      const dialogRef = this.dialog.open(ModalHistoricoPagosComponent, {
        width: '350px',
        disableClose: false
      });

     
    }
    if (button.label === 'Facturación') {
      const dialogRef = this.dialog.open(ModalFacturacionComponent, {
        width: '550px',
        disableClose: false
      });

      
    }
    if (button.label === 'Oficio de Habilitación') {
        const dialogRef = this.dialog.open(ModalValidarReciboOficioComponent, {
          width: '350px',
          disableClose: false
      });
    }
    this.actionOnToolbarMenu.emit(false)
  }
  
}
