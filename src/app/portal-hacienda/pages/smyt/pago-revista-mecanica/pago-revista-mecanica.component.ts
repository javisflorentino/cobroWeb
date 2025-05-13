import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { ConvertXmlString } from 'src/app/shared/clases/convert-xml-string';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

import ListMessageSmyt from '../../../../../../data/arreglos/smyt_mensajes.json'
import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';
import Swal from 'sweetalert2';
import { estadoVehiculo } from 'src/app/shared/interfaces/soap-estadoVehivulo';
import { Router } from '@angular/router';

@Component({
  selector: 'smyt-pago-revista-mecanica',
  templateUrl: './pago-revista-mecanica.component.html',
  styleUrls: ['./pago-revista-mecanica.component.css']
})
export class PagoRevistaMecanicaComponent implements OnInit {
  public mssgArr: MessageSmyt[] = ListMessageSmyt.smyt_refrendo;
  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Se usa para obtener el nombre del concepto seleccionado y mostrarlo en el HTML */
  public nameConcept: string = '';
  /* Variable de tipo Interface-ValidateVehicle */
  private asJson!: estadoVehiculo;//ValidateVehicle;

  private fb = inject(FormBuilder);
  private validatorsService = inject(ValidatorsService);
  private _snackBar = inject(MatSnackBar);
  private smytService = inject(SmytService);
  private router = inject(Router);

  /* Inicialización del formulario reactivo */
  public revistaMecanicaForm: FormGroup = this.fb.group({
    id: [''],
    placa: ['', [Validators.required, Validators.minLength(4)]],
    serie: ['', [Validators.required, Validators.minLength(5)]]
  }, {
    validators: [this.validatorsService.existsSeriesPublico('serie', 'placa', 1, 9, '1', '')]
  });

  /* Deshabilitar esta funcion, solo se creo para monitorear evento de navegación */
  //public subscription: Subscription;
  /* Recibe un arreglo de tipo  ConvertXmlString*/
  private xmlSring: ConvertXmlString = new ConvertXmlString();

  private smytSevice = inject(SmytService);

  @HostListener('input', ['$event']) onKeyUp(event: any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  ngOnInit(): void {
    this.nameConcept = sessionStorage.getItem('concept')!;
  }

  onSubmit(): void {
    this.isLoading = true;

    if (this.revistaMecanicaForm.invalid) {
      this.revistaMecanicaForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    let p = this.revistaMecanicaForm.get('placa')!.value;
    let s = this.revistaMecanicaForm.get('serie')?.value;

    this.smytService.validateVehiclePublico({ "tramite": 9, "placa": p, "numeroSerie": String(s), "obtenerContribuyente": false, "obtenerVehiculo": true })
      .subscribe({
        next: (resp) => {
          if (resp?.success) {
            sessionStorage.setItem('vehicle_data', JSON.stringify({ "placa": p, "numeroSerie": String(s), "tramite": 9, "obtenerContribuyente": true }));
            sessionStorage.setItem('vehicle_data_adicional', JSON.stringify({
              "vMarca": resp.data.adicional?.vMarca,
              "vSubmarca": resp.data.adicional?.vSubmarca,
              "noCilindros": resp.data.adicional?.noCilindros,
              "placaAnterior": resp.data.adicional?.placaAnterior,
              "modelo": resp.data.adicional?.modelo,
              "tipoVehiculo": resp.data.adicional?.tipoVehiculo
            }));
            this.router.navigate(['/pagos/tabla-conceptos', 916]);
            return
          }
          Swal.fire({ icon: "error", title: "Error!!", text: resp?.data.toString(), allowOutsideClick: false });
          this.isLoading = false;
        },
        error: (err) => {
          Swal.fire({ icon: "error", title: "Error!!", text: err.message, allowOutsideClick: false });
          this.isLoading = false;
        },
        complete: () => { }
      });

  }

  isValidField(field: string) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField(this.revistaMecanicaForm, field);
  }

  getMessage(idMssg: number, nameField: string) {
    let touched = this.revistaMecanicaForm.get(nameField)?.touched;
    let nameFileValue = this.revistaMecanicaForm.get(nameField)?.value;
    let pathSelect = this.validatorsService.alfaPath;

    if (idMssg !== null) {
      const message = this.mssgArr.filter(({ id }) => id == idMssg);
      return message[0].msg;
    }
    if (touched) {
      let idMessage = 100;

      let pattern = new RegExp(pathSelect);
      if (!pattern.test(nameFileValue) || nameFileValue == null) {
        const message = this.mssgArr.filter(({ id }) => id == idMessage);
        this.revistaMecanicaForm.get(nameField)?.setErrors({ notEqual: true, error: idMessage });
        return message[0].msg;
      }

    }
    return '';
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message, duration: 5500, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
    });
  }


}
