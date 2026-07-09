import { Component, HostListener, inject } from '@angular/core';

import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';
import { Oficinas } from 'src/app/portal-hacienda/interface/portal-oficinas.interface';
import { estadoVehiculo } from 'src/app/shared/interfaces/soap-estadoVehivulo';

import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';

import { ConvertXmlString } from 'src/app/shared/clases/convert-xml-string';

import ListMessageSmyt from '../../../../../../data/arreglos/smyt_mensajes.json';
import ListaOficinas from '../../../../../../data/arreglos/smyt_oficinas_tramite.json';

import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { Router, ActivatedRoute } from '@angular/router';
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
  /* Almacena la opción de modalidad desde los parámetros de la URL */
  public opcion: string = '';
  /* Controla si se muestra el campo de serie vehicular */
  public mostrarSerie: boolean = true;
  /* Inicialización del formulario reactivo */
  public refrendoSerPubForm: FormGroup = this.fb.group({
    id: [''],
    oficina: ['', [Validators.required]],
    placa: ['', [Validators.required, Validators.minLength(4)]],
    confirmarPlaca: ['', [Validators.required]],
    serie: ['', [Validators.required, Validators.minLength(5)]],
    confirmarSerie: ['', [Validators.required]],
    folio_concesion: ['', [Validators.required, Validators.minLength(5)]],
    confirmarFolioConcesion: ['', [Validators.required]]
  }, {
    validators: [
    
      this.isFieldOneEqualFielTwo('placa', 'confirmarPlaca', 2),
      this.isFieldOneEqualFielTwo('folio_concesion', 'confirmarFolioConcesion', 3),
      this.isFieldOneEqualFielTwo('serie', 'confirmarSerie', 4)
    ]
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
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    /*this.subscription = router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('refresco el navegador Refrendo')
      }
    });*/
  }

  ngOnInit(): void {
    this.nameConcept = sessionStorage.getItem('concept')!;
    // Capturar el parámetro 'opc' de los query params
    this.activatedRoute.queryParams.subscribe(params => {
      this.opcion = params['opc'] || '';
      this.actualizarVisibilidadSerie();
    });
    //this.refrendoForm.markAllAsTouched();
  }

  ngOnDestroy(): void {
    console.log('Destruido');
    //this.subscription.unsubscribe();
  }

  /**
   * Actualiza la visibilidad del campo de serie vehicular según el valor de opc.
   * Si opc es null, vacío, 1 o 3 -> se muestra la serie
   * Si opc es 2 -> se oculta la serie
   */
  private actualizarVisibilidadSerie(): void {
    const opc = this.opcion;
    // Mostrar serie si opc es null, vacío, "1" o "3"
    // Ocultar serie si opc es "2"
    if (opc === null || opc === '' || opc === '1' || opc === '3') {
      this.mostrarSerie = true;
      this.refrendoSerPubForm.get('serie')?.setValidators([Validators.required, Validators.minLength(5)]);
      this.refrendoSerPubForm.get('confirmarSerie')?.setValidators([Validators.required]);
    } else {
      this.mostrarSerie = false;
      this.refrendoSerPubForm.get('serie')?.clearValidators();
      this.refrendoSerPubForm.get('confirmarSerie')?.clearValidators();
      this.refrendoSerPubForm.get('serie')?.setValue('');
      this.refrendoSerPubForm.get('confirmarSerie')?.setValue('');
    }
    this.refrendoSerPubForm.get('serie')?.updateValueAndValidity();
    this.refrendoSerPubForm.get('confirmarSerie')?.updateValueAndValidity();
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

    // Determinar tipoConcesion y tramite según la opción
    const opc = this.opcion;
    let tipoConcesion: number;
    let tramite: number;

    if (opc === null || opc === '' || opc === '1' || opc === '3') {
      tipoConcesion = 1;
      tramite = 3;
    } else {
      tipoConcesion = 2;
      tramite = 3;
    }

    this.smytService.validarVehiculo2({
      "placa": p.toUpperCase(),
      "numeroSerie": String(s?.toUpperCase() || ''),
      "numeroConcesion": String(fc.toUpperCase()),
      "tramite": tramite,
      "tipoConcesion": String(tipoConcesion),
      "opcion": this.opcion
    })
      .subscribe({
        next: (resp) => {
          if(resp?.success && resp.data) {
            sessionStorage.setItem('vehicle_data', JSON.stringify({
              "placa": p,
              "numeroSerie": String(s || ''),
              "tipoConcesion": tipoConcesion,
              "numeroConcesion": String(fc),
              "tramite": tramite,
              "opcion": this.opcion,
              "obtenerContribuyente": true
            }));
            this.router.navigate(['/pagos/tabla-conceptos', 881]);
            return
          }
          Swal.fire({icon: "error", title: "Error!!", text: "Los datos son incorrectos", allowOutsideClick:false});
              this.isLoading = false;
              this.buttBlock = false;

        },
        error: (err) => {
          Swal.fire({icon: "error", title: "Error!!", text: err.message, allowOutsideClick:false});
              this.isLoading = false;
              this.buttBlock = false;
        }
      })
  }

  isValidField(field: string) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField(this.refrendoSerPubForm, field);
  }
  getMessage(idMssg: number, nameField: string) {
    let touched = this.refrendoSerPubForm.get(nameField)?.touched;
    let nameFileValue = this.refrendoSerPubForm.get(nameField)?.value;
    let pathSelect = this.validatorsService.alfaPath;

    if (idMssg !== null && idMssg !== undefined) {
      const message = this.mssgArr.filter(({ id }) => id == idMssg);
      if (message.length > 0) {
        return message[0].msg;
      }
      return 'Valor inválido';
    }
    if (touched) {
      let idMessage = 100;

      let pattern = new RegExp(pathSelect);
      if (!pattern.test(nameFileValue) || nameFileValue == null) {
        const message = this.mssgArr.filter(({ id }) => id == idMessage);
        if (message.length > 0) {
          this.refrendoSerPubForm.get(nameField)?.setErrors({ notEqual: true, error: idMessage });
          return message[0].msg;
        }
        return 'Valor inválido';
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

  /**
   * Validador personalizado para comparar dos campos del formulario
   * Similar a isFieldOneEqualFielTwo del ValidatorsService
   */
  private isFieldOneEqualFielTwo(field1: string, field2: string, mssg: number) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const fielValue1 = formGroup.get(field1)?.value;
      const fielValue2 = formGroup.get(field2)?.value;

      if (String(fielValue1).toUpperCase() !== String(fielValue2).toUpperCase()) {
        formGroup.get(field2)?.setErrors({ notEqual: true, error: mssg });
        return { notEqual: true, error: mssg };
      }
      formGroup.get(field2)?.markAsTouched();
      formGroup.get(field2)?.setErrors(null);
      return null;
    }
  }
}
