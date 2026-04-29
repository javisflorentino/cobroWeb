import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { environments } from 'src/environments/environments';

@Component({
  selector: 'app-modal-comprobante-pago',
  templateUrl: './modal-comprobante-pago.component.html',
  styleUrls: ['./modal-comprobante-pago.component.css']
})
export class ModalComprobantePagoComponent {
  paymentForm: FormGroup = this.fb.group({
    captureLine: ['', Validators.required],
  }); captureLineInvalid = false;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalComprobantePagoComponent>
  ) { }

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      captureLine: ['', Validators.required],
    });
  }

  search(): void {
    if (this.paymentForm?.valid) {
      const formData = this.paymentForm.value;
      const url = `${environments.URL_PAGO_EN_LINEA_RECIBO}/cfd/imprimirCfd?lineaCaptura=${formData.captureLine}`;
      //`https://app.administracionyfinanzas.morelos.gob.mx/recibo/cfd/imprimirCfd?lineaCaptura=${formData.captureLine}`; // Ajusta la URL base a la correcta

      window.open(url, '_blank'); // Abre el recibo en una nueva pestaña
      this.dialogRef.close(); // Cierra el modal si deseas
    } else {
      this.captureLineInvalid = true;
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
