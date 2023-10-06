import { Component } from '@angular/core';

import ListaOficinas from '../../../../../../data/arreglos/smyt_oficinas_tramite.json';
import { Oficinas } from 'src/app/portal-hacienda/interface/portal-oficinas.interface';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { Router } from '@angular/router';

@Component({
  selector: 'smyt-pago-refrendo-page',
  templateUrl: './pago-refrendo-page.component.html',
  styles: [
  ]
})
export class PagoRefrendoPageComponent {

  public oficinasArr: Oficinas[] = ListaOficinas;
  public alertMesage: boolean = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  public refrendoForm = new FormGroup({
    id: new FormControl(''),
    oficina: new FormControl(),
    placa: new FormControl(''),
    serie: new FormControl('')
  });

  constructor(
    private _snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    private router: Router ) {}

  isValidField() {

  }

  onSubmit(): void {
    if (this.refrendoForm.invalid) {
      this.alertMesage = true
      this.openSnackBar('Verifique los campos requeridos');
      return;
    }
    console.log(this.refrendoForm)
    this.router.navigate(['/pagos/tabla-conceptos']);
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 5000
    });
  }
}
