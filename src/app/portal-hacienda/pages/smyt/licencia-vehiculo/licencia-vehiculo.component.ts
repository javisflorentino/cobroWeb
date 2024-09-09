import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { ValidatorsFormService } from 'src/app/shared/validators/validators-form.service';
import { Moment } from 'moment';
import moment from 'moment';
import { Subject, Subscription, debounceTime, takeUntil } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';



@Component({
  selector: 'smyt-licencia-vehiculo',
  templateUrl: './licencia-vehiculo.component.html',
  styleUrls: ['./licencia-vehiculo.component.css']
})
export class LicenciaVehiculoComponent implements OnInit, OnDestroy {

  public buttBlock: boolean = true;
  public formBlock: boolean = true;

  private debounce: Subject<string> = new Subject<string>();
  private debouncerSubscription?: Subscription;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  @ViewChild('no_licencia')
  private no_licencia!: ElementRef<HTMLInputElement>;

  public minDate!: Moment;
  public maxDate!: Moment;

  public tipoform: number = 0;
  public idConcepto: number = 0;

  public conceptTitle: string = '';

  public formLicencias: FormGroup = this.fb.group({
    no_licencia:       [{value:'',disabled:this.formBlock}, [Validators.required,Validators.minLength(7), Validators.maxLength(20)] ],
    fecha_vencimiento: [{value:new Date(),disabled:this.formBlock}, [Validators.required, this.validatorFormService.noOlderDay] ],
    tien_licencia:     ['', [Validators.required] ]
  });

  public messages: Messages[] = [];
  public messages_other: Messages[] = [];

  public tipoLic: string = '';

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

  get fecha_vencimiento() {
    return this.formLicencias.get('fecha_vencimiento')?.value
  }

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private _snackBar: MatSnackBar,
      private validatorsService: ValidatorsService,
      private validatorFormService: ValidatorsFormService,
      private smytService: SmytService,
      private breakpointObserver: BreakpointObserver,
      private activatedRoute: ActivatedRoute,
  ) {
    const currentYear = moment().year();
    const currentMonth = moment().month() + 1;
    this.maxDate = moment([currentYear , 10, 30]);

    this.mediaQuery();
  }
  ngOnDestroy(): void {
    this.debouncerSubscription?.unsubscribe();
  }


  ngOnInit(): void {
    let msg: string = '';

    //localStorage.removeItem('contribuyente');
    this.smytService.getMessages_licencia()
      .subscribe( message => {
        this.messages = message;
        if (this.sizeDisplay === 'Small' || this.sizeDisplay === 'XSmall') {
          this.messages.forEach(mss=> {
            msg += mss.message + "<br><br>";
          });
          this.openSnackBar(msg);
        }
      });

      //Observable que se mantiene vivo mientras no se abandone el componente. Ejemplo cuando se cambia en el meni de 5 a 3 años por ejemplo
      this.activatedRoute.params.subscribe(({idConcepto,tipoForm}) => {
        this.conceptTitle = localStorage.getItem('concept')!;

        this.tipoform = tipoForm;
        this.idConcepto = idConcepto;
        localStorage.setItem('route_origen','smyt/smyt-licencia-vehiculo/' + this.idConcepto + '/' + this.tipoform)
      });

      this.debouncerSubscription = this.debounce
      .pipe(
        debounceTime(500)
      )
      .subscribe( value => {
        const resp = this.validatorFormService.licenseValidate(value,this.idConcepto);
        if (resp) {
          this.formLicencias.get('no_licencia')?.setErrors({notUnique:true});
          this.openSnackBar(resp);
        }
      });

      if ([838,835,830].find(resp => resp == this.idConcepto ) ) {
        this.tipoLic = 'AUTOMOVILISTA';
      }
      if ([837,834,829].find(resp => resp == this.idConcepto ) ) {
        this.tipoLic = 'CHOFER';
      }
      if ([839,836,831].find(resp => resp == this.idConcepto ) ) {
        this.tipoLic = 'MOTOCICLISTA';
      }
  }

  onKeyPress( searchTerm: string ) {
    this.debounce.next( searchTerm );
  }

  onSubmit() {
    this.isLoading = true;
    this.buttBlock = true;

    if ( this.formLicencias.valid ) {
      if ( this.idConcepto && this.idConcepto !== 0 ) {
        this.router.navigate(['/pagos/tabla-conceptos', this.idConcepto, this.tipoform]);
        return;
      }
      this.openSnackBar("No se cuenta con un Id Concepto o el valor es 0, favor de seguir el proceso correcto");
      this.isLoading = false;
    }
    this.formLicencias.markAllAsTouched();
    this.isLoading = false;
    this.buttBlock = false;
  }

  tieneLicencia(event:number) {

    if ( event == 1 ) {
      this.formBlock = false;
      this.formLicencias.get('no_licencia')?.enable();
      this.formLicencias.get('fecha_vencimiento')?.enable();
      this.no_licencia.nativeElement.focus();
      return;
    }
    if ( this.idConcepto > 0 ) {
      this.router.navigate(['/pagos/tabla-conceptos', this.idConcepto, this.tipoform]);
      return;
    }
    this.openSnackBar("No se cuenta con un Id Concepto o el valor es 0, favor de seguir el proceso correcto");
    this.isLoading = false;
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 15000,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }

  isValidField( field: string ) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField( this.formLicencias, field );
  }
  public mediaQuery() {

    this.breakpointObserver
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
}
