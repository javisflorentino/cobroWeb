import { Component, HostListener, inject } from '@angular/core';

import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';
import { Oficinas } from 'src/app/portal-hacienda/interface/portal-oficinas.interface';
import { estadoVehiculo } from 'src/app/shared/interfaces/soap-estadoVehivulo';

import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';

import { ConvertXmlString } from 'src/app/shared/clases/convert-xml-string';

import ListMessageSmyt from '../../../../../../data/arreglos/smyt_mensajes.json';
import ListaOficinas from '../../../../../../data/arreglos/smyt_oficinas_tramite.json';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pago-refrendo-servicio-publico',
  templateUrl: './pago-refrendo-servicio-publico.component.html',
  styles: [
  ]
})
export class PagoRefrendoServicioPublicoComponent {
  public mssgArr: MessageSmyt[] = ListMessageSmyt.smyt_refrendo;
  /* Arreglo de oficinas de SMyT */
  public oficinasArr: Oficinas[] = ListaOficinas;
  /* Variable de tipo Interface-ValidateVehicle */
  private asJson!: estadoVehiculo;//ValidateVehicle;
  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;
  /* Se usa para obtener el nombre del concepto seleccionado y mostrarlo en el HTML */
  public nameConcept: string = '';
  /* Inicialización del formulario reactivo */
  public refrendoSerPubForm: FormGroup = this.fb.group({
    id: [''],
    oficina: ['', [Validators.required]],
    placa: ['', [Validators.required, Validators.minLength(4)]],
    serie: ['', [Validators.required, Validators.minLength(5)]],
    folio_concesion: ['', [Validators.required, Validators.minLength(5)]]
  }, {
    validators: [this.validatorsService.existsSeriesPublico('serie', 'placa', 1, 3, '1', 'folio_concesion')]
  });
  /* Deshabilitar esta funcion, solo se creo para monitorear evento de navegación */
  //public subscription: Subscription;
  /* Recibe un arreglo de tipo  ConvertXmlString*/
  private xmlSring: ConvertXmlString = new ConvertXmlString();

  private smytSevice = inject(SmytService);

  @HostListener('input', ['$event']) onKeyUp(event: any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    private smytService: SmytService,
    private router: Router
  ) {
    /*this.subscription = router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('refresco el navegador Refrendo')
      }
    });*/
  }

  ngOnInit(): void {
    this.nameConcept = sessionStorage.getItem('concept')!;
    //this.refrendoForm.markAllAsTouched();
  }

  ngOnDestroy(): void {
    console.log('Destruido');
    //this.subscription.unsubscribe();
  }

  onSubmit(): void {
    this.isLoading = true;
    this.buttBlock = true;
    if (this.refrendoSerPubForm.invalid) {
      this.refrendoSerPubForm.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }

    let p = this.refrendoSerPubForm.get('placa')!.value;
    let s = this.refrendoSerPubForm.get('serie')?.value;
    let fc = this.refrendoSerPubForm.get('folio_concesion')?.value;

    this.smytService.validarVehiculo({ "placa": p.toUpperCase(), "numeroSerie": String(s.toUpperCase()), "numeroConcesion": String(fc.toUpperCase()) })
      .subscribe({
        next: (resp) => {
          if(resp?.success && resp.data) {
            sessionStorage.setItem('vehicle_data', JSON.stringify({ "placa": p, "numeroSerie": String(s), "tipoConcesion":1, "numeroConcesion":String(fc), "tramite": 3, "obtenerContribuyente": true }));
            this.router.navigate(['/pagos/tabla-conceptos', 881]);
            return
          }
          Swal.fire({icon: "error", title: "Error!!", text: "El vehiculo no se encuentra registrado", allowOutsideClick:false});
              this.isLoading = false;
              this.buttBlock = false;

        },
        error: (err) => {
          Swal.fire({icon: "error", title: "Error!!", text: err.message, allowOutsideClick:false});
              this.isLoading = false;
              this.buttBlock = false;
        }
      })


    /*this.smytSevice.validateVehicleSoap(p, s)
      .then(response => response.text())
      .then(xml => {
        this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
        const response = this.asJson['soap:Envelope']['soap:Body']['ns2:obtenEstatusVehiculoResponse'].estatusVehiculo.vehiculo.noSerie['#text'];
        sessionStorage.setItem('vehicle_data', JSON.stringify({ "placa": p, "numeroSerie": String(response), "tramite": 1, "obtenerContribuyente": true }));
        this.smytService.validateVehicle({ "tramite": 1, "placa": p, "numeroSerie": String(response), "obtenerContribuyente": false, "obtenerVehiculo":true })
          .subscribe({
            next: (resp) =>{
              if (resp?.success) {
                sessionStorage.setItem('vehicle_data_adicional', JSON.stringify({
                  "vMarca":        resp.data.adicional?.vMarca,
                  "vSubmarca":     resp.data.adicional?.vSubmarca,
                  "noCilindros":   resp.data.adicional?.noCilindros,
                  "placaAnterior": resp.data.adicional?.placaAnterior,
                  "modelo":        resp.data.adicional?.modelo,
                  "tipoVehiculo":  resp.data.adicional?.tipoVehiculo
                }));
                this.router.navigate(['/pagos/tabla-conceptos', 1]);
                return
              }
              Swal.fire({icon: "error", title: "Error!!", text: resp?.data.toString(), allowOutsideClick:false});
              this.isLoading = false;
              this.buttBlock = false;
            },
            error: (err) =>{
              Swal.fire({icon: "error", title: "Error!!", text: err.message, allowOutsideClick:false});
              this.isLoading = false;
              this.buttBlock = false;
            },
            complete: () => {}
          });
      })
      .catch(err => {
        Swal.fire({icon: "error", title: "Error!!", text: err.message, allowOutsideClick:false});
        this.isLoading = false;
        this.buttBlock = false;
      });*/




  }

  isValidField(field: string) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField(this.refrendoSerPubForm, field);
  }
  getMessage(idMssg: number, nameField: string) {
    let touched = this.refrendoSerPubForm.get(nameField)?.touched;
    let nameFileValue = this.refrendoSerPubForm.get(nameField)?.value;
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
        this.refrendoSerPubForm.get(nameField)?.setErrors({ notEqual: true, error: idMessage });
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

  redirectHome(): void {
    location.reload();
  }
}
