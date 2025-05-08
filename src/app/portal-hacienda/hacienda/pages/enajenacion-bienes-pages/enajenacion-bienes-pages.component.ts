import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { formatDate } from '@angular/common';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'hacienda-enajenacion-bienes-pages',
  templateUrl: './enajenacion-bienes-pages.component.html',
  styles: [
  ]
})
export class EnajenacionBienesPagesComponent implements OnInit, OnDestroy {

  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  public conceptTitle: string = '';

  //Se obtiene una referencia a todo el componente que se renderizó en este componente. Se uso el nombre del componente
  private idConcepto: number = 0;
  private tipoForm: number = 0;

  private ActivatedRouteSubscribe?: Subscription;
  private breakpointObserverControl!: Subscription;


  private fb = inject( FormBuilder );
  public myFormHEnajenacion: FormGroup = this.fb.group(
    {
      escritura:       ['', [Validators.required]],
      contribuyente:   ['',[Validators.required, Validators.pattern(this.validatorService.peoplesNamePath)]],
      fecha_escritura: [moment(),[Validators.required]],
      monto:           [1, [Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberPattern)]]
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

  @HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  constructor(private validatorService: ValidatorsService,
              private router: Router,
              private activateRaute: ActivatedRoute,
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
    this.ActivatedRouteSubscribe = this.activateRaute.params.subscribe(({idConcept,tipoForm}) => {
      this.idConcepto = idConcept;
      this.tipoForm = tipoForm;
    });
  }

  getMessage(idMssg:ValidationErrors|null|undefined, nameField:string) {
    if ( !idMssg ) {
      return '';
    }
    const errors = Object.keys(idMssg);
    if(errors.includes('required')) {
      return 'Este campo requerido';
    }
    if(errors.includes('min')) {
      return 'No se permite valor menor a 1';
    }
    if(errors.includes('max')) {
      return 'Para poder continuar seleccione NO';
    }
    if(errors.includes('pattern')) {
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

  onSubmit() {
    this.isLoading = true;
    this.buttBlock = true;
    if ( this.myFormHEnajenacion.invalid ) {
      this.myFormHEnajenacion.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }

    localStorage.setItem('route_origen',`hacienda/hacienda-enajenacion/${this.idConcepto}/${this.tipoForm}`);
    localStorage.setItem('datos_cobro',JSON.stringify(
      {
        cantidad:      1,
        monto:         Number(this.myFormHEnajenacion.get('monto')?.value),
        fecha_verificacion_escritura:   formatDate(this.myFormHEnajenacion.get('fecha_escritura')?.value,'yyyy-MM-dd','en-US'),
        fecha:   formatDate(this.myFormHEnajenacion.get('fecha_escritura')?.value,'yyyy-MM-dd','en-US'),

        tipo_form:     this.tipoForm,
        contribuyente: this.myFormHEnajenacion.get('contribuyente')?.value,
        escritura:     this.myFormHEnajenacion.get('escritura')?.value
      })
    )

    this.router.navigate(['/pagos/tabla-conceptos',this.idConcepto,this.tipoForm]);
    return
  }

}
