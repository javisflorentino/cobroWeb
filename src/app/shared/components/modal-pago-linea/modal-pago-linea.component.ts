import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { DatosPoliza } from '../../interfaces/datos-poliza';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { Poliza } from 'src/app/portal-hacienda/interface/portal-datos-poliza.interface';

@Component({
  selector: 'app-modal-pago-linea',
  templateUrl: './modal-pago-linea.component.html',
  styleUrls: ['./modal-pago-linea.component.css']
})
export class ModalPagoLineaComponent {
  public smytService = inject(SmytService);
  public dataPoliza = {} as Poliza;
    /* Bloque el boton de Calcular para evitar acciones duplicadas  */
    public buttBlock = false;

    //Controla la visualización del Spinner
    public isLoading: boolean = false;
  paymentForm: FormGroup = this.fb.group({
    captureLine: ['', Validators.required],
    amount: ['', Validators.required]
  });  captureLineInvalid = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _snackBar: MatSnackBar,
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
      this.dataPoliza.lineaCaptura = this.paymentForm.get('captureLine')!.value;
      this.dataPoliza.total = this.paymentForm.get('amount')!.value;
    /*  this.smytService.generarPolizaServ(this.dataPoliza)
      .subscribe(resp => {
        this.isLoading = false;
        this.buttBlock = false;
        if ( resp.success) {
          localStorage.setItem('datos_poliza',JSON.stringify(resp.poliza));
          this.router.navigate(['pagos/generar_poliza']);
          return;
        }
        this.openSnackBar(resp.data!);
        return;
    });     */ 
    this.router.navigate(['pagos/generar_poliza']);

    this.dialogRef.close(this.paymentForm?.value);
    } else {
      // Marcar línea de captura como inválida para mostrar el mensaje de error
      this.captureLineInvalid = true;
    }
  }
  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 4000,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }
  close(): void {
    this.dialogRef.close();
  }
}
