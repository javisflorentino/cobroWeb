import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from 'src/app/shared/services/validators.service';


@Component({
  selector: 'smyt-licencia-vehiculo',
  templateUrl: './licencia-vehiculo.component.html',
  styleUrls: ['./licencia-vehiculo.component.css']
})
export class LicenciaVehiculoComponent implements OnInit {

  public buttBlock: boolean = true;
  public formBlock: boolean = true;

  private horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  private verticalPosition: MatSnackBarVerticalPosition = 'top';
  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  @ViewChild('no_licencia')
  private no_licencia!: ElementRef<HTMLInputElement>;

  public formLicencias: FormGroup = this.fb.group({
    no_licencia:       [{value:'',disabled:this.formBlock}, [Validators.required] ],
    fecha_vencimiento: [{value:'',disabled:this.formBlock}, [Validators.required] ],
    tien_licencia:     ['', [Validators.required] ]
  });

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private _snackBar: MatSnackBar,
      private validatorsService: ValidatorsService
  ) {}

  ngOnInit(): void {
    console.log(localStorage.getItem('idConcepto'));
  }

  onSubmit() {
    if ( this.formLicencias.valid ) {
      if ( localStorage.getItem('idConcepto')  && localStorage.getItem('idConcepto') !== "0" ) {
        this.router.navigate(['/pagos/tabla-conceptos', localStorage.getItem('idConcepto')]);
        return;
      }
      this.openSnackBar("No se cuenta con un Id Concepto o el valor es 0, favor de seguir el proceso correcto");
      this.isLoading = false;
    }
    this.formLicencias.markAllAsTouched();
  }

  tieneLicencia(event:number) {
    console.log(event);
    if ( event == 1 ) {
      this.formBlock = false;
      this.formLicencias.get('no_licencia')?.enable();
      this.formLicencias.get('fecha_vencimiento')?.enable();
      this.no_licencia.nativeElement.focus();
      return;
    }
    if ( localStorage.getItem('idConcepto')  && localStorage.getItem('idConcepto') !== "0" ) {
      this.router.navigate(['/pagos/tabla-conceptos', localStorage.getItem('idConcepto')]);
      return;
    }
    this.openSnackBar("No se cuenta con un Id Concepto o el valor es 0, favor de seguir el proceso correcto");
    this.isLoading = false;
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000
    });
  }

  isValidField( field: string ) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField( this.formLicencias, field );
  }
}
