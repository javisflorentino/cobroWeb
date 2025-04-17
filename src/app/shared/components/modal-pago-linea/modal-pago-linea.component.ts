import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-pago-linea',
  templateUrl: './modal-pago-linea.component.html',
  styleUrls: ['./modal-pago-linea.component.css']
})
export class ModalPagoLineaComponent {
  paymentForm: FormGroup = this.fb.group({
    captureLine: ['', Validators.required],
    amount: ['', Validators.required]
  });  captureLineInvalid = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalPagoLineaComponent>
  ) { }

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      captureLine: ['', Validators.required],
      amount: ['', Validators.required]
    });
  }

  search(): void {
    if (this.paymentForm?.valid) {
      // Aquí iría la lógica para procesar el pago
      this.dialogRef.close(this.paymentForm?.value);
    } else {
      // Marcar línea de captura como inválida para mostrar el mensaje de error
      this.captureLineInvalid = true;
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
