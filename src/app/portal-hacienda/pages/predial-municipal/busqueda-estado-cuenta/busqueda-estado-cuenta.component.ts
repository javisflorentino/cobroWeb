import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';


import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';import { ComboConcept } from 'src/app/portal-hacienda/interface/datos-combo.interface';
import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
@Component({
  selector: 'app-busqueda-estado-cuenta',
  templateUrl: './busqueda-estado-cuenta.component.html',
  styleUrls: ['./busqueda-estado-cuenta.component.css']
})
export class BusquedaEstadoCuentaComponent {
  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;
  public municipiosArr: ComboConcept[] = [];
  
  public predialMunicipal: FormGroup = this.fb.group({
    claveCatastral: [''],
    validador: ['', [Validators.required]],
    municipio: ['', [Validators.required, Validators.minLength(4)]]
  }, {
    validators: [this.validatorsService.existsSeries('serie', 'placa', 1, 1, '1', '')]
  });

  constructor(
      private fb: FormBuilder,
      private _snackBar: MatSnackBar,
      private validatorsService: ValidatorsService,
      private router: Router,
      private generalesService: GeneralesService
    ) { }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 5500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }

  getMunicipios(event: string): void {
    this.generalesService.getLocalida(event)
      .subscribe(resp => {
        if(!resp){
          this.openSnackBar('Problema con el API-SERVER, favor de contactar a Servicio Técnico ');
        } else {
          this.municipiosArr = resp.data;
        }

      });
  }
  onSubmit(): void {
     
  
     
  
    }
}
