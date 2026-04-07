import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

//import ListaOficinas from '../../../../../../data/arreglos/smyt_oficinas_tramite.json';
//import { Oficinas } from 'src/app/portal-hacienda/interface/portal-oficinas.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidatorsFormService } from 'src/app/shared/validators/validators-form.service';

@Component({
  selector: 'app-expedicion-gafete-operador',
  templateUrl: './expedicion-gafete-operador.component.html',
  styleUrls: ['./expedicion-gafete-operador.component.css']
})
export class ExpedicionGafeteOperadorComponent implements OnInit, OnDestroy {

  /* Carlo A. 07/04/2026 - Implementación de nuevas variables */
  private debounce: Subject<string> = new Subject<string>();
  private debouncerSubscription?: Subscription;
  private validatorFormService = inject(ValidatorsFormService);
  private _snackBar = inject(MatSnackBar);

  /* Arreglo de oficinas de SMyT */
  //public oficinasArr: Oficinas[] = ListaOficinas;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  /* Se usa para obtener el nombre del concepto seleccionado y mostrarlo en el HTML */
  public nameConcept: string = '';

  /* Inicialización del formulario reactivo */
  public expGafPubForm: FormGroup = this.fb.group({
    /*id: [''],
    placa: ['', [Validators.required, Validators.minLength(4)]],
    agrupacion: ['', [Validators.required, Validators.pattern(this.validatorsService.alfaPath)]],
    numero_economico: ['', [Validators.required, Validators.pattern(this.validatorsService.alfaPath)]],*/
    no_licencia: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
  });

  private smytSevice = inject(SmytService);
  private router = inject(Router);

  /* MANEJO DE INFORMACION RECIBIDA POR LA URL */
  private activateRaute = inject(ActivatedRoute);
  private ActivatedRouteSubscribe!: Subscription;

  //Se obtiene una referencia a todo el componente que se renderizó en este componente. Se uso el nombre del componente
  private idConcepto: number = 0;
  private tipoForm: number = 0;

  /* CONTROLA EL NOMBRE DEL CONCEPTO Y MOSTRARLO EN HTML */
  public conceptTitle: string = '';

  /* Carlo A. 07/04/2026 - Nuevo Bloque */
  @ViewChild('no_licencia')
  private no_licencia!: ElementRef<HTMLInputElement>;
  @HostListener('input', ['$event']) onKeyUp(event: any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  constructor(private fb: FormBuilder, private validatorsService: ValidatorsService) { }

  ngOnInit(): void {
    this.ActivatedRouteSubscribe = this.activateRaute.params.subscribe(({ idConcepto, tipoForm }) => {
      this.idConcepto = idConcepto;
      this.tipoForm = tipoForm;
      this.conceptTitle = sessionStorage.getItem('concept')!;
    });

    /* Carlo A. 07/04/2026 */
    this.debouncerSubscription = this.debounce
      .pipe(
        debounceTime(500)
      )
      .subscribe(value => {
        const resp = this.validatorFormService.licenseValidateGafete(value, this.idConcepto);
        if (resp) {
          this.expGafPubForm.get('no_licencia')?.setErrors({ notUnique: true });
          this.openSnackBar(resp);
        }
      });
  }

  /* Carlo A. 07/04/2026 - Manejo de suscripciones */
  ngOnDestroy(): void {
    this.debouncerSubscription?.unsubscribe();
  }

  isValidField(field: string) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField(this.expGafPubForm, field);
  }

  onSubmit() {
    this.isLoading = true;

    if (this.expGafPubForm.invalid) {
      this.expGafPubForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    //let concesion = this.expGafPubForm.get('concesion')!.value;
    /*let placa = this.expGafPubForm.get('placa')!.value;
    let agrupacion = this.expGafPubForm.get('agrupacion')!.value;
    let numero_economico = this.expGafPubForm.get('numero_economico')!.value;*/

    /* Carlo A. 07/04/2026 */
    let no_licencia = this.expGafPubForm.get('no_licencia')!.value;

    sessionStorage.setItem('datos_cobro', JSON.stringify({ licencia: no_licencia, idConcepto: this.idConcepto, tipo_form: this.tipoForm }));
    this.router.navigate(['/pagos/tabla-conceptos', 873, 19]);
    return;

    /* Carlos A. 07/04/2026 - Se comentó este bloque*/
    /*this.smytSevice.obtenerGafeteOperador({ "licencia": no_licencia.toUpperCase(), "tramite": 11 })
      .subscribe({
        next: (resp) => {
          if (resp?.success && resp.data) {
            //sessionStorage.setItem('vehicle_data', JSON.stringify({ "numeroConcesion": String(concesion), "tramite": 11}));
            //sessionStorage.setItem('datos_cobro', JSON.stringify({folio: concesion,idConcepto: this.idConcepto,tipo_form: this.tipoForm}));
            sessionStorage.setItem('datos_cobro', JSON.stringify({ licencia: no_licencia, idConcepto: this.idConcepto, tipo_form: this.tipoForm }));
            this.router.navigate(['/pagos/tabla-conceptos', 873, 19]);
            return;
          }
          Swal.fire({ icon: "error", title: "Error!!", text: "La concesión no se encuentra registrada", allowOutsideClick: false });
          this.isLoading = false;
        },
        error: (err) => {
          Swal.fire({ icon: "error", title: "Error!!", text: err.message, allowOutsideClick: false });
          this.isLoading = false;
        }
      })*/
  }

  /* Carlo A. 07/04/2026 */
  onKeyPress(searchTerm: string) {
    this.debounce.next(searchTerm);
  }

  /* Carlo A. 07/04/2026 */
  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message, duration: 15000, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
    });
  }
}
