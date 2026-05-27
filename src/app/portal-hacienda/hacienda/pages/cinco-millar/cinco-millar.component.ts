import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import moment from 'moment';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { YearPickerComponent } from 'src/app/portal-hacienda/hacienda/components/year-picker/year-picker.component';

import ListaConceptos from '../../../../../../data/arreglos/conceptos_cinco_millar.json';
import ListaFondo from '../../../../../../data/arreglos/fondo_aplicable_cinco_millar.json';
import { FondoCincoMillar } from 'src/app/portal-hacienda/interface/fondo_cinco_millar';
import { ConceptoCincoMillar } from 'src/app/portal-hacienda/interface/conceptos_cinco_millar';
import { MatDatepicker } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-cinco-millar',
  templateUrl: './cinco-millar.component.html',
  styleUrls: ['./cinco-millar.component.css'],
})
export class CincoMillarComponent implements OnInit, OnDestroy {

  public listaConceptos: ConceptoCincoMillar[] = ListaConceptos;
  public listaFondos: FondoCincoMillar[] = [];

  private ActivatedRouteSubscribe?: Subscription;
  private breakpointObserverControl!: Subscription;

  private breakpointObserver = inject(BreakpointObserver);
  private validatorService = inject(ValidatorsService);
  private router = inject(Router);
  private activateRaute = inject(ActivatedRoute);

  //Se obtiene una referencia a todo el componente que se renderizó en este componente. Se uso el nombre del componente
  private idConcepto = signal<number>(0);
  private tipoForm = signal<number>(0);
  public isLoading = signal<boolean>(false);
  public conceptTitle = signal<string>('');

  private fb = inject(FormBuilder);
  public formCincoMillar: FormGroup = this.fb.group(
    {
      concepto: ['', [Validators.required]],
      fondo: ['', [Validators.required]],
      fecha_retencion: [moment(), [Validators.required]],
      ejercicio_fiscal: [moment().format('YYYY'), [Validators.required]],
      no_obra: ['', [Validators.required]],
      desc_obra: ['', [Validators.required]],
      fuente_finan: ['', [Validators.required]],
      monto_ejercicio: [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberPattern)]],
      ente_ejecutor: ['', [Validators.required]],
      nombre_programa: ['', [Validators.required]],
      no_oficio: ['', [Validators.required]],
      modalidad_ejecucion: ['', [Validators.required]],
      no_factura: ['', [Validators.required]],
      no_estimacion: ['', [Validators.required]],
      monto_retenido: [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberPattern)]],
      nombre_contact: ['', [Validators.required]],
      tel_contact: ['', [Validators.required, Validators.pattern(this.validatorService.expNoTelNew)]],
      email_contact: ['', [Validators.required, Validators.pattern(this.validatorService.emailPattern)]],
    }
  );

  get ejercicioFiscalControl(): FormControl {
    return this.formCincoMillar.get('ejercicio_fiscal') as FormControl;
  }

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

  //@ViewChild(YearPickerComponent) yearPickerComponent!: YearPickerComponent;

  constructor() {
    this.mediaQuery();
  }

  ngOnInit(): void {
    this.conceptTitle.set(sessionStorage.getItem('concept')!);
    this.ActivatedRouteSubscribe = this.activateRaute.params.subscribe(({ idConcept, tipoForm }) => {
      this.idConcepto.set(idConcept);
      this.tipoForm.set(tipoForm);
    });
  }
  ngOnDestroy(): void {
    this.ActivatedRouteSubscribe?.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
    this.breakpointObserverControl.unsubscribe();
  }


  onSubmit() {
    this.isLoading.set(true);

    if (this.formCincoMillar.invalid) {
      this.formCincoMillar.markAllAsTouched();
      this.isLoading.set(false);
      return;
    }
    console.log(this.formCincoMillar.get('concepto')?.value);
    sessionStorage.setItem('datos_cobro', JSON.stringify(
      {
        cantidad: 1,
        nombre_fondo : this.listaFondos.find(c => c.id === this.formCincoMillar.get('fondo')?.value)?.descripcion || '',
        concepto: this.listaConceptos.find(c => c.id === this.formCincoMillar.get('concepto')?.value)?.descripcion || '',
        ejercicio_fiscal: formatDate(this.formCincoMillar.get('ejercicio_fiscal')?.value, 'yyyy', 'es-MX'),
        fecha_retencion: formatDate(this.formCincoMillar.get('fecha_retencion')?.value, 'dd/MM/yyyy', 'es-MX'),
        no_obra: this.formCincoMillar.get('no_obra')?.value,
        desc_obra: this.formCincoMillar.get('desc_obra')?.value,
        fuente_financiamiento : this.formCincoMillar.get('fuente_finan')?.value,
        ejercicio: this.formCincoMillar.get('monto_ejercicio')?.value,
        ente_ejecutor: this.formCincoMillar.get('ente_ejecutor')?.value,
        nombre_programa: this.formCincoMillar.get('nombre_programa')?.value,
        numero_oficio : this.formCincoMillar.get('no_oficio')?.value,
        modalidad_ejecucion: this.formCincoMillar.get('modalidad_ejecucion')?.value,
        numero_factura : this.formCincoMillar.get('no_factura')?.value,
        no_estimacion: this.formCincoMillar.get('no_estimacion')?.value,
        monto_retenido: this.formCincoMillar.get('monto_retenido')?.value,
        nombre_contact: this.formCincoMillar.get('nombre_contact')?.value,
        telefono: this.formCincoMillar.get('tel_contact')?.value,
        email: this.formCincoMillar.get('email_contact')?.value,
        tipo_form: this.tipoForm()
      }));

    this.router.navigate(['/pagos/tabla-conceptos', this.listaConceptos.find(c => c.id === this.formCincoMillar.get('concepto')?.value)?.idConcepto , this.tipoForm()]);
    return

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

  changeField(value: any) {
    this.listaFondos = ListaFondo.filter((fondo) => fondo.idConcepto == value);
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

  // Helper opcional por si necesitas extraer solo el string del año al enviar a tu API
  enviarFormulario() {
    if (this.formCincoMillar.valid) {
      const datosEnvio = {
        ...this.formCincoMillar.value,
        // Transforma el objeto Moment en un string de 4 dígitos (ej: "2026")
        ejercicio_fiscal: this.formCincoMillar.get('ejercicio_fiscal')?.value.format('YYYY')
      };
    }
  }

}
