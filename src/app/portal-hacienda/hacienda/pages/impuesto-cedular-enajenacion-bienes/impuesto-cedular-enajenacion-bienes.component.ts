import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { formatDate } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { FileTransferService } from 'src/app/portal-hacienda/services/file-transfer.service';

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
  public isUploadEnabled = false;

  private arrFiles = signal<File | null>(null);

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
      fecha_enajenacion: [{ value: moment(), disabled: true }, [Validators.required]],
      fecha_provisional_escritura: [moment(), [Validators.required]],
      //monto: [1, [Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberPattern)]],

      tipo_ingresos: ['', [Validators.required]],
      tiene_exencion: ['0', [Validators.required]],

      costo_comprobado: ["0", [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberIntFloatPattern)]],
      importe_inversion: [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberIntFloatPattern)]],
      gastos_notariales: [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberIntFloatPattern)]],
      comisiones_mediaciones: [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberIntFloatPattern)]],
      otras_deducciones: [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberIntFloatPattern)]],

      tiene_escritura: ['1', [Validators.required]],
      noPhone: ['', [Validators.required, Validators.pattern(this.validatorService.expNoTel)]],
      email: ['', [Validators.required, Validators.pattern(this.validatorService.emailPattern)]],

      referencia_inmueble: ['', [Validators.required]],
      monto_avaluo: [0, [Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberIntFloatPattern)]],
      ingreso_enajenacion: [0, [Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberIntFloatPattern)]],

      //calcula_base_impuesto: ['1', [Validators.required]],

      rfc: ['XAXX010101000', [Validators.required, Validators.pattern(this.validatorService.rfcFisica)]],
      nombre: ['', [Validators.required]],
      notaria: ['', [Validators.required]],
      entidad: ['', [Validators.required]],
      demarcacion: ['', [Validators.required]],

      rfc_perito: ['XAXX010101000', [Validators.required, Validators.pattern(this.validatorService.rfcFisica)]],
      nombre_perito: ['', [Validators.required]],
      domicilio_perito: ['', [Validators.required]],
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
    private breakpointObserver: BreakpointObserver,
    private fileTransferService: FileTransferService) {
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
    this.conceptTitle = sessionStorage.getItem('concept')!;
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
      this.formHEnajenacionBienes.get('fecha_provisional_escritura')?.disable();
      this.formHEnajenacionBienes.get('fecha_enajenacion')?.enable();
      return;
    }
    this.formHEnajenacionBienes.get('escritura')?.enable();
    this.formHEnajenacionBienes.get('fecha_enajenacion')?.disable();
    this.formHEnajenacionBienes.get('fecha_provisional_escritura')?.enable();
    return;
  }

  onChangeExencion(value: string) {
    this.isUploadEnabled = value === '1';
  }

  validarYSubirArchivo(fileUpload: HTMLInputElement) {
    fileUpload.click();
  }

  onChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.arrFiles.set(file);
    // Clear the input
    event.target.value = null;
    this.fileTransferService.setFile(file);

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

    if (this.formHEnajenacionBienes.get('tiene_exencion')?.value === '1' && !this.arrFiles()) {
      this.openSnackBar('Debe subir el documento que acredite la exención.');
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }

    let base_Impuesto = Number(this.formHEnajenacionBienes.get('ingreso_enajenacion')?.value)
      - (Number(this.formHEnajenacionBienes.get('costo_comprobado')?.value)
        + Number(this.formHEnajenacionBienes.get('importe_inversion')?.value)
        + Number(this.formHEnajenacionBienes.get('gastos_notariales')?.value)
        + Number(this.formHEnajenacionBienes.get('comisiones_mediaciones')?.value)
        + Number(this.formHEnajenacionBienes.get('otras_deducciones')?.value)
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
        fecha_provisional_escritura: formatDate(this.formHEnajenacionBienes.get('fecha_provisional_escritura')?.value, 'dd/MM/yyyy', 'es-MX'),

        tipo_ingresos: this.formHEnajenacionBienes.get('tipo_ingresos')?.value,

        tipo_form: this.tipoForm,
        noPhone: this.formHEnajenacionBienes.get('noPhone')?.value,
        email: String(this.formHEnajenacionBienes.get('email')?.value).toUpperCase(),

        referencia_inmueble: String(this.formHEnajenacionBienes.get('referencia_inmueble')?.value).toUpperCase(),
        monto_avaluo: Number(this.formHEnajenacionBienes.get('monto_avaluo')?.value),
        ingreso_enajenacion: Number(this.formHEnajenacionBienes.get('ingreso_enajenacion')?.value),
        tiene_escritura: this.formHEnajenacionBienes.get('tiene_escritura')?.value,

        tiene_exencion: this.formHEnajenacionBienes.get('tiene_exencion')?.value,

        costo_comprobado: Number(this.formHEnajenacionBienes.get('costo_comprobado')?.value),
        importe_inversion: Number(this.formHEnajenacionBienes.get('importe_inversion')?.value),
        gastos_notariales: Number(this.formHEnajenacionBienes.get('gastos_notariales')?.value),
        comisiones_mediaciones: Number(this.formHEnajenacionBienes.get('comisiones_mediaciones')?.value),
        otras_deducciones: Number(this.formHEnajenacionBienes.get('otras_deducciones')?.value),

        //calcula_base_impuesto: this.formHEnajenacionBienes.get('calcula_base_impuesto')?.value,

        nombre: String(this.formHEnajenacionBienes.get('nombre')?.value).toUpperCase(),
        rfc: String(this.formHEnajenacionBienes.get('rfc')?.value).toUpperCase(),
        notaria: String(this.formHEnajenacionBienes.get('notaria')?.value).toUpperCase(),
        entidad: String(this.formHEnajenacionBienes.get('entidad')?.value).toUpperCase(),
        demarcacion: String(this.formHEnajenacionBienes.get('demarcacion')?.value).toUpperCase(),

        nombre_perito: String(this.formHEnajenacionBienes.get('nombre_perito')?.value).toUpperCase(),
        rfc_perito: String(this.formHEnajenacionBienes.get('rfc_perito')?.value).toUpperCase(),
        domicilio_perito: String(this.formHEnajenacionBienes.get('domicilio_perito')?.value).toUpperCase(),
      })
    )

    if (this.formHEnajenacionBienes.get('tiene_exencion')?.value === '1') {
      sessionStorage.setItem('contribuyente', JSON.stringify(
        {
          data: {
            total: 5,
            conceptos: [
              {
                id: 331926,
                clave: "0383",
                cantidad: 1,
                descripcion: "IMPUESTO CEDULAR POR LA ENAJENACIÓN DE BIENES INMUEBLES",
                ejercicioFiscal: new Date().getFullYear(),
                importe: 0,
                importeUnitario: 0,
                conceptoArea: 6673,
                unitario: 0
              }
            ],
            lineaDetalle: "331926¬0383¬1¬IMPUESTO CEDULAR POR LA ENAJENACIÓN DE BIENES INMUEBLES¬"+new Date().getFullYear()+"¬0.00¬¬6673¬0.0¬|",
            observaciones: "undefined"
          },
          success: true
        })
      );
      this.router.navigate(['pagos/datos-contribuyente']);
      return;
    }

    this.router.navigate(['/pagos/tabla-conceptos', this.idConcepto, this.tipoForm]);
    return
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message, duration: 3500, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
    });
  }
}
