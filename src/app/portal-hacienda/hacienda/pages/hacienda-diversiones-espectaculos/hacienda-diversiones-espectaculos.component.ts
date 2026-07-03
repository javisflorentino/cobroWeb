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
  selector: 'hacienda-diversiones-espectaculos',
  templateUrl: './hacienda-diversiones-espectaculos.component.html',
  styles: [
  ]
})
export class HaciendaDiversionesEspectaculosComponent implements OnInit, OnDestroy {

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
  public myFormDiversionesEspectaculos: FormGroup = this.fb.group(
    {
      fecha_evento:     [moment(),[Validators.required]],
      numero_boletos:   [1, [Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberPattern)]],
      impuesto:         [1, [Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberPattern)]],
      actualizacion:    [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberPattern)]],
      recargos:         [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberPattern)]]
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
    console.log('Destruction DiversionesEspectaculos-page');
    this.ActivatedRouteSubscribe?.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
    this.breakpointObserverControl.unsubscribe();
  }

  ngOnInit(): void {
    this.conceptTitle = sessionStorage.getItem('concept')!;
    this.ActivatedRouteSubscribe = this.activateRaute.params.subscribe(({idconcept,tipoform}) => {
      this.idConcepto = idconcept;
      this.tipoForm = tipoform;
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

  validarFormulario() {
    this.isLoading = true;
    this.buttBlock = true;
    if ( this.myFormDiversionesEspectaculos.invalid ) {
      this.myFormDiversionesEspectaculos.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }

    const fechaFormateada = formatDate(this.myFormDiversionesEspectaculos.get('fecha_evento')?.value,'dd/MM/yyyy','en-US');

    const datos_cobro = [
      {
        "id": "sh-form-20",
        "idConcepto": this.idConcepto,
        "data": [
          {
            "id": "sh-input-impuesto",
            "value": Number(this.myFormDiversionesEspectaculos.get('impuesto')?.value)
          },
          {
            "id": "sh-input-actualizacion",
            "value": Number(this.myFormDiversionesEspectaculos.get('actualizacion')?.value)
          },
          {
            "id": "sh-input-recargo",
            "value": Number(this.myFormDiversionesEspectaculos.get('recargos')?.value)
          },
          {
            "id": "sh-input-cantidad",
            "value": Number(this.myFormDiversionesEspectaculos.get('numero_boletos')?.value)
          },
          {
            "id": "sh-input-fecha",
            "value": fechaFormateada
          }
        ]
      }
    ];

    sessionStorage.setItem('route_origen',`hacienda/hacienda-diversiones-espetaculos/${this.idConcepto}/${this.tipoForm}`);
    sessionStorage.setItem('datos_cobro',JSON.stringify(datos_cobro));

    this.router.navigate(['/pagos/tabla-conceptos',this.idConcepto,this.tipoForm]);
    return
  }

}
