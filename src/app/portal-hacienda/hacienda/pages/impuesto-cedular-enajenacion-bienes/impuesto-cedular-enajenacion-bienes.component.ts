import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { formatDate } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

import ListaIngresoEnajenacion from '../../../../../../data/arreglos/tipo_ingresos_enajenacion.json';
import { TipoIngresoEnajenacion } from '../../../interface/tipo_ingresos_enajenacion_interface';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';

@Component({
  selector: 'hacienda-impuesto-cedular-enajenacion-bienes',
  templateUrl: './impuesto-cedular-enajenacion-bienes.component.html',
  styles: [
    `
    .blanco {
      background-color: white;
      color: black; /* Para asegurar buena visibilidad del texto */
    }

    .gris {
      background-color: lightgray;
      color: black;
    }
    `
  ]
})
export class ImpuestoCedularEnajenacionBienesComponent implements OnInit, OnDestroy {
  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  public messages: Messages[] = [];
  public messages_other: Messages[] = [];

  /* Arreglo de Lista de Ingresos por Enajenación */
  public tipoIngEnajenacionArr: TipoIngresoEnajenacion[] = ListaIngresoEnajenacion;

  public conceptTitle: string = '';

  //Se obtiene una referencia a todo el componente que se renderizó en este componente. Se uso el nombre del componente
  private idConcepto: number = 0;
  private tipoForm: number = 0;

  public tiene_escritura: number = 1;

  private ActivatedRouteSubscribe?: Subscription;
  private breakpointObserverControl!: Subscription;

  private fb = inject(FormBuilder);
  public formHEnajenacionBienes: FormGroup = this.fb.group(
    {
      escritura: ['', [Validators.required]],
      //contribuyente: ['', [Validators.required, Validators.pattern(this.validatorService.peoplesNamePath)]],
      fecha_enajenacion: [moment(), [Validators.required]],
      //monto: [1, [Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberPattern)]],

      tipo_ingresos: ['', [Validators.required]],

      costo_comprobado: ["0", [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberIntFloatPattern)]],
      importe_inversion: [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberIntFloatPattern)]],
      gastos_notariales: [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberIntFloatPattern)]],
      comisiones_mediaciones: [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberIntFloatPattern)]],

      tiene_escritura: ['1', [Validators.required]],
      noPhone: ['', [Validators.required, Validators.pattern(this.validatorService.expNoTel)]],
      email: ['', [Validators.required, Validators.pattern(this.validatorService.emailPattern)]],

      referencia_inmueble: ['', [Validators.required]],
      monto_avaluo: [0, [Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberIntFloatPattern)]],
      ingreso_enajenacion: [0, [Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberIntFloatPattern)]],

      calcula_base_impuesto: ['1', [Validators.required]],
    }
  );

  public sizeDisplay!: string;
  destroyed = new Subject<void>();
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  @HostListener('input', ['$event']) onKeyUp(event: any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  constructor(private validatorService: ValidatorsService,
    private router: Router,
    private activateRaute: ActivatedRoute,
    private smytService: SmytService,
    private _snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver) {
    this.mediaQuery();
  }

  ngOnDestroy(): void {
    console.log('Destruction Enajenacion-page');
    this.ActivatedRouteSubscribe?.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
    this.breakpointObserverControl.unsubscribe();
  }

  ngOnInit(): void {
    let msg: string = '';
    this.smytService.getMesages_hacienda_exencion()
      .subscribe(message => {
        this.messages = message;
        if (this.sizeDisplay === 'Small' || this.sizeDisplay === 'XSmall') {
          this.messages.forEach(mss => {
            msg += mss.message + "<br><br>";
          });
          this.openSnackBar(msg);
        }
      });

    this.ActivatedRouteSubscribe = this.activateRaute.params.subscribe(({ idConcept, tipoForm }) => {
      this.idConcepto = idConcept;
      this.tipoForm = tipoForm;
    });
  }

  getMessage(idMssg: ValidationErrors | null | undefined, nameField: string) {
    if (!idMssg) {
      return '';
    }
    const errors = Object.keys(idMssg);
    if (errors.includes('required')) {
      return 'Este campo requerido';
    }
    if (errors.includes('min')) {
      return 'No se permite valor menor a 1';
    }
    if (errors.includes('max')) {
      return 'Para poder continuar seleccione NO';
    }
    if (errors.includes('pattern')) {
      return 'Formato incorrecto';
    }

    return '';
  }
  public mediaQuery() {
    this.breakpointObserverControl = this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.sizeDisplay = this.displayNameMap.get(query) ?? 'Unknown';
          }
        }
      });
  }

  changeRadioTP(evento: string): void {
    this.tiene_escritura = Number(evento);
    if (evento === '0') {
      this.formHEnajenacionBienes.get('escritura')?.disable();
      return;
    }
    this.formHEnajenacionBienes.get('escritura')?.enable();
    return;
  }

  isValidField(field: string) {
    //TODO: Obtener validación desde un servicio
    return this.validatorService.isValidField(this.formHEnajenacionBienes, field);
  }

  onSubmit() {
    this.isLoading = true;
    this.buttBlock = true;
    if (this.formHEnajenacionBienes.invalid) {
      this.formHEnajenacionBienes.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }

    let base_Impuesto = Number(this.formHEnajenacionBienes.get('ingreso_enajenacion')?.value)
      - (Number(this.formHEnajenacionBienes.get('costo_comprobado')?.value)
        + Number(this.formHEnajenacionBienes.get('importe_inversion')?.value)
        + Number(this.formHEnajenacionBienes.get('gastos_notariales')?.value)
        + Number(this.formHEnajenacionBienes.get('comisiones_mediaciones')?.value)
      );

    if (base_Impuesto < 0) {
      base_Impuesto = 0;
    }

    sessionStorage.setItem('route_origen', `hacienda/hacienda-impuesto-cedular/${this.idConcepto}/${this.tipoForm}`);
    sessionStorage.setItem('datos_cobro', JSON.stringify(
      {
        cantidad: 1,
        base_impuesto: base_Impuesto,
        percent_base_impuesto: base_Impuesto * 0.03, // 3% de impuesto cedular

        escritura: String(this.formHEnajenacionBienes.get('escritura')?.value).toUpperCase(),
        fecha_enajenacion: formatDate(this.formHEnajenacionBienes.get('fecha_enajenacion')?.value, 'dd/MM/yyyy', 'es-MX'),

        tipo_ingresos: this.formHEnajenacionBienes.get('tipo_ingresos')?.value,

        tipo_form: this.tipoForm,
        noPhone: this.formHEnajenacionBienes.get('noPhone')?.value,
        email: String(this.formHEnajenacionBienes.get('email')?.value).toUpperCase(),

        referencia_inmueble: String(this.formHEnajenacionBienes.get('referencia_inmueble')?.value).toUpperCase(),
        monto_avaluo: Number(this.formHEnajenacionBienes.get('monto_avaluo')?.value),
        ingreso_enajenacion: Number(this.formHEnajenacionBienes.get('ingreso_enajenacion')?.value),
        tiene_escritura: this.formHEnajenacionBienes.get('tiene_escritura')?.value,

        costo_comprobado: Number(this.formHEnajenacionBienes.get('costo_comprobado')?.value),
        importe_inversion: Number(this.formHEnajenacionBienes.get('importe_inversion')?.value),
        gastos_notariales: Number(this.formHEnajenacionBienes.get('gastos_notariales')?.value),
        comisiones_mediaciones: Number(this.formHEnajenacionBienes.get('comisiones_mediaciones')?.value),

        calcula_base_impuesto: this.formHEnajenacionBienes.get('calcula_base_impuesto')?.value
      })
    )

    this.router.navigate(['/pagos/tabla-conceptos', this.idConcepto, this.tipoForm]);
    return
  }

  openSnackBar(message: string) {
      this._snackBar.openFromComponent(SnackBarComponent, {
        data: message,duration: 3500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
      });
    }
}
