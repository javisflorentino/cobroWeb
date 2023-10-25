import { Component, ViewChild, Pipe, OnDestroy, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Subject, Subscribable, Subscription, takeUntil } from 'rxjs';
import { FormAltaVehiculoComponent } from 'src/app/portal-hacienda/components/smyt/form-alta-vehiculo/form-alta-vehiculo.component';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { TipoVehiculo } from '../../../interface/portal-tipovehiculo.interface';
import { AnioMin } from 'src/app/portal-hacienda/interface/portal_genericas.interfacce';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';


@Component({
  selector: 'smyt-alta-vehiculo-usado-page',
  templateUrl: './alta-vehiculo-usado-page.component.html',
  styles: [
  ],
})
export class AltaVehiculoUsadoPageComponent implements OnDestroy, AfterViewInit {

  public step: number = 0;

  aniosPago = [
    {name: '2018', value:'p2018'},
    {name: '2019', value:'p2019'},
    {name: '2020', value:'p2020'}
  ]

  public anio: number = new Date().getFullYear();

  subscription!: Subscription;
  private checkboxControl!: Subscription;
  private vehicleType!: Subscription;
  submittedValue: any;

  //Intanciaa de un objeto de tipo FormBuilder
  public myForm: FormGroup = this.fb.group({
    modelo:       [ '',[ Validators.required, Validators.max(this.anio + 1), Validators.min(AnioMin.ANIOMIN_VEHICLE) ] ], // Entre 1900 - 2024
    procedencia:  [ 'NACIONAL', [Validators.required]], // Nacional, Extranjero
    uso_vehiculo: [ '' ], // se infiere que es particular
    cilindros:    [ '', [ Validators.required, Validators.max(16), Validators.pattern(this.validatorService.numberPattern)] ],
    centimetros:  [ {value: '', disabled: true}, [Validators.required, Validators.pattern(this.validatorService.numberPattern)]],
    pasajeros:    [ '', [ Validators.required] ],
    valor_factura:[ '', [ Validators.required, Validators.pattern(this.validatorService.numberPattern)]],
    placa_foranea:[ '', [ Validators.required] ],
    pago_baja_f:  [ '1', [Validators.required] ],
    pagos:        this.fb.array(this.aniosPago.map(x => false))
  });

  // al seleccionar motociclista se habilita centimetros cubicos y se deshabilita cilindros
  //Si selecciona auto antiguo mando un alert
  public messages: Messages[] = [];
  public messages_other: Messages[] = [];

  public conceptTitle: string = '';

  //Se obtiene una referencia a todo el componente que se renderizó en este componente
  @ViewChild(FormAltaVehiculoComponent)
  private childComponent!: FormAltaVehiculoComponent;


  private horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  private verticalPosition: MatSnackBarVerticalPosition = 'top';
  public sizeDisplay!: string;
  destroyed = new Subject<void>();
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  //Metodo sincrono que devuelve un valor especifico con formato, en este caso devuelve parte del Form por referencia como un FormArray
  get ordersFormArray() {
    return this.myForm.controls['pagos'] as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private smytService: SmytService,
    private validatorService: ValidatorsService,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar
  ) {
    this.mediaQuery();
  }

  // Se implementó para la carga del formulario FormAltaVehiculoComponent
  ngAfterViewInit(): void {
    console.log('ngAfterViewInit')
    setTimeout( () => {
      this.myForm.addControl('oficinas',this.childComponent.myFormShared);
      this.childComponent.myFormShared.setParent(this.myForm);
    });

    //this.openSnackBar(message: string)

  }

  ngOnInit(): void {
    console.log('ngOnInit')
    //Obtiene el Nombre del concepto que se requiere procesar
    this.conceptTitle = localStorage.getItem('concept')!;
    let msg: string = '';
    //Llamado al sevico para obtener los mensajes a mostrar
    this.smytService.getMessages()
      .subscribe( message => {
        this.messages = message;
        if (this.sizeDisplay === 'Small' || this.sizeDisplay === 'XSmall') {
          this.messages.forEach(mss=> {
            msg += mss.message;
          });
          this.openSnackBar(msg);
        }
      });

    // Observable de los cambios suscitado en el apartado del formulario "pagos" y modifica el valor del elemento,
    //que en un inicio es FALSE por el valor del arreglo
    this.checkboxControl = this.ordersFormArray.valueChanges.subscribe(checkbox => {
      this.ordersFormArray.setValue(
        this.ordersFormArray.value.map((value: any, i:any)  => value ? this.aniosPago[i].value : false),
        { emitEvent: false }
      );
    });

    /*this.vehicleType = this.myForm.valueChanges.pipe(
      // debounceTime(1000)
    ).subscribe(
      data=>{
        console.log(data)
      }
    );*/



  }



  updateFiel(event: number): void {
    if (event === 8) {
      this.myForm.get('centimetros')?.enable();
      this.myForm.get('cilindros')?.disable();
      return;
    }
    if(event === 7) {
      this.smytService.getMessages_vehicle()
        .subscribe( message => {
          this.messages_other = message;
        });
    }

    if(this.messages_other.length > 0) this.messages_other = [];

    if ( this.myForm.get('centimetros')?.enabled ) this.myForm.get('centimetros')?.disable();

    if ( this.myForm.get('cilindros')?.disabled ) this.myForm.get('cilindros')?.enable();

    return;
  }

  ngOnDestroy() {
    this.checkboxControl.unsubscribe();
    //this.vehicleType.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }

  get oficinas() {
    console.log(this.myForm.get('oficinas'))
    return this.myForm.get('oficinas')?.disable;
  }

  isValidField( field: string ) {
    //TODO: Obtener validación desde un servicio
    return this.validatorService.isValidField( this.myForm, field );
  }

  // Metodo que se encarga de llamar al servicio para calcular el monto a pagar y redireccionar a componente correspondiente
  calcularPago() {
    if ( this.myForm.invalid ) {
      this.myForm.markAllAsTouched();
      return;
    }
    const checkboxControl = this.ordersFormArray;
    const formValue = {
      ...this.myForm.value,
      pagos: checkboxControl.value.filter((value: any) => !!value)
    }
    this.submittedValue = formValue;
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

  setStep(index: number): void {
    this.step = index;
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Cerrar', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 5000
    });
  }
}
