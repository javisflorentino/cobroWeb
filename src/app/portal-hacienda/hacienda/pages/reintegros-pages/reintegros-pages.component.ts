import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { ReintegrosStruct } from 'src/app/portal-hacienda/interface/reintegros-struct.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

const moment = _rollupMoment || _moment;


@Component({
  selector: 'hacienda-reintegros-pages',
  templateUrl: './reintegros-pages.component.html',
  styles: [
  ]
})
export class ReintegrosPagesComponent implements OnInit, OnDestroy {


  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  public conceptTitle: string = '';

  public enableContFourteen: boolean = false;
  public enableContSeventeen: boolean = false;

  public arrEjercicioFiscal: number[] = [];

  public messages: Messages[] = [];

  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  private ActivatedRouteSubscribe?: Subscription;

  //Se obtiene una referencia a todo el componente que se renderizó en este componente. Se uso el nombre del componente
  private idConcepto: number = 0;
  private tipoForm: number = 0;

  private fb = inject( FormBuilder );
  public myFormHReintegro: FormGroup = this.fb.group(
    {
      nombre:   ['', [Validators.required, Validators.pattern(this.validatorService.peoplesNamePath)]],
      telefono: ['', [Validators.required, Validators.pattern(this.validatorService.expNoTelNew)]],
      email:    ['', [Validators.required, Validators.pattern(this.validatorService.emailPattern)]],
      monto:    [1, [Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberPattern)]],
      dependencia:   ['', [Validators.required]],
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

  private breakpointObserverControl!: Subscription;

  constructor( private validatorService: ValidatorsService,
               private router: Router,
               private activateRaute: ActivatedRoute,
               private _snackBar: MatSnackBar,
               private smytService: SmytService,
               private breakpointObserver: BreakpointObserver ) {
                this.mediaQuery();
               }

  ngOnInit(): void {

    this.arrEjercicioFiscal.push(new Date().getFullYear());
    this.arrEjercicioFiscal.push(new Date().getFullYear() - 1);
    this.arrEjercicioFiscal.push(new Date().getFullYear() - 2);
    let msg: string = '';
    this.smytService.getMesages_hacienda_reintegros()
      .subscribe( message => {
        this.messages = message;
        if (this.sizeDisplay === 'Small' || this.sizeDisplay === 'XSmall') {
          this.messages.forEach(mss=> {
            msg += mss.message + "<br><br>";
          });
          this.openSnackBar(msg);
        }
      });
    this.ActivatedRouteSubscribe = this.activateRaute.params.subscribe(({idConcept,tipoForm}) => {
      this.idConcepto = idConcept;
      this.tipoForm = tipoForm;
      this.enableContFourteen = false;
      this.enableContSeventeen = false;
      this.conceptTitle = sessionStorage.getItem('concept')!;
      if( this.tipoForm==14 ) {
        this.enableContFourteen = true;
        this.myFormHReintegro.addControl('reintegro', new FormControl('0',[Validators.required, Validators.max(0)]));
        return;
      }
      if( this.tipoForm == 17 ) {
        this.enableContSeventeen = true;
        //this.myFormHReintegro.addControl('fecha_retencion', new FormControl(moment(),[Validators.required, this.validatorService.validateRetencion]));
        this.myFormHReintegro.addControl('fecha_retencion', new FormControl(moment(),[Validators.required]));
        this.myFormHReintegro.addControl('ejercicio_fiscal', new FormControl(new Date().getFullYear(),[Validators.required]));
        this.myFormHReintegro.addControl('nombre_fondo', new FormControl('',[Validators.required]));
        this.myFormHReintegro.addControl('numero_contrato', new FormControl('',[Validators.required]));
        this.myFormHReintegro.addControl('objeto_contrato', new FormControl('',[Validators.required]));
        this.myFormHReintegro.addControl('fuente_financiamiento', new FormControl('',[Validators.required]));
        this.myFormHReintegro.addControl('monto_ejercido', new FormControl('1',[Validators.required]));
        this.myFormHReintegro.addControl('monto_retenido', new FormControl('1',[Validators.required]));
        this.myFormHReintegro.addControl('numero_oficio', new FormControl('',[Validators.required]));
        this.myFormHReintegro.addControl('numero_factura', new FormControl('',[Validators.required]));
        return;
      }
      this.myFormHReintegro.removeControl('reintegro');
      this.myFormHReintegro.removeControl('fecha_retencion');
      this.myFormHReintegro.removeControl('ejercicio_fiscal');
      this.myFormHReintegro.removeControl('nombre_fondo');
      this.myFormHReintegro.removeControl('numero_contrato');
      this.myFormHReintegro.removeControl('objeto_contrato');
      this.myFormHReintegro.removeControl('fuente_financiamiento');
      this.myFormHReintegro.removeControl('monto_ejercido');
      this.myFormHReintegro.removeControl('monto_retenido');
      this.myFormHReintegro.removeControl('numero_oficio');
      this.myFormHReintegro.removeControl('numero_factura');

    });
  }

  ngOnDestroy(): void {
    //this.activateRaute.params.subscribe().unsubscribe();
    console.log('Destruction Impuestos-page');
    this.ActivatedRouteSubscribe?.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
    this.breakpointObserverControl.unsubscribe();
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
    if(errors.includes('fechaFueraRango')){
      return 'La fecha de retención debe estar dentro del ejercicio fiscal actual.'
    }

    return '';
  }

  changeReintegro(event:number) {
    if (event==1) {
      this.openSnackBar('Para obtener su póliza de pago, solicítela en la administración de rentas mas cercana.');
    }
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 3500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
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
    if ( this.myFormHReintegro.invalid ) {
      this.myFormHReintegro.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      if(this.myFormHReintegro.get('reintegro') && this.myFormHReintegro.get('reintegro')?.value == 1) {
        this.openSnackBar('Para obtener su póliza de pago, solicítela en la administración de rentas mas cercana.')
      }
      return;
    }

    sessionStorage.setItem('route_origen',`hacienda/hacienda-reintegros/${this.idConcepto}/${this.tipoForm}`);
    let datos_cobro: ReintegrosStruct = {} as ReintegrosStruct;
    datos_cobro.cantidad =  1;
    datos_cobro.monto =     Number(this.myFormHReintegro.get('monto')?.value);
    datos_cobro.nombre =    String(this.myFormHReintegro.get('nombre')?.value).toUpperCase();
    datos_cobro.telefono =  this.myFormHReintegro.get('telefono')?.value;
    datos_cobro.email =     String(this.myFormHReintegro.get('email')?.value).toUpperCase();
    datos_cobro.tipo_form = this.tipoForm;
    datos_cobro.dependencia = String(this.myFormHReintegro.get('dependencia')?.value).toUpperCase();
    if( this.tipoForm == 17 ) {
      const fecha = moment(this.myFormHReintegro.get('fecha_retencion')?.value);
      datos_cobro.fecha_retencion =       fecha.format('YYYY-MM-DD');
      datos_cobro.ejercicio_fiscal =      this.myFormHReintegro.get('ejercicio_fiscal')?.value;
      datos_cobro.nombre_fondo =          String(this.myFormHReintegro.get('nombre_fondo')?.value).toUpperCase();
      datos_cobro.numero_contrato =       this.myFormHReintegro.get('numero_contrato')?.value;
      datos_cobro.objeto_contrato =       String(this.myFormHReintegro.get('objeto_contrato')?.value).toUpperCase();
      datos_cobro.fuente_financiamiento = String(this.myFormHReintegro.get('fuente_financiamiento')?.value).toUpperCase();
      datos_cobro.monto_ejercido =        this.myFormHReintegro.get('monto_ejercido')?.value;
      datos_cobro.monto_retenido =        this.myFormHReintegro.get('monto_retenido')?.value;
      datos_cobro.numero_oficio =         this.myFormHReintegro.get('numero_oficio')?.value;
      datos_cobro.numero_factura =        this.myFormHReintegro.get('numero_factura')?.value;
    }

    sessionStorage.setItem('datos_cobro',JSON.stringify(datos_cobro));

    this.router.navigate(['/pagos/tabla-conceptos',this.idConcepto,this.tipoForm]);
    return
  }
}
