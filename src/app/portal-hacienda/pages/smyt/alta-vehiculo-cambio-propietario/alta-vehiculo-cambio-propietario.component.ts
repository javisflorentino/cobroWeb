import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterContentInit, Component, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import moment from 'moment';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { DataVehicleComponent } from 'src/app/portal-hacienda/components/smyt/data-vehicle/data-vehicle.component';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { AnioMin } from 'src/app/portal-hacienda/interface/portal_genericas.interfacce';
import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
import { SmytValidatorService } from 'src/app/portal-hacienda/services/smyt-validator.service';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';
import { DatosTramite } from 'src/app/shared/interfaces/datos-tramite.interface';

@Component({
  selector: 'app-alta-vehiculo-cambio-propietario',
  templateUrl: './alta-vehiculo-cambio-propietario.component.html',
  styles: [
  ]
})
export class AltaVehiculoCambioPropietarioComponent implements OnInit, AfterContentInit, OnDestroy {
  //Controla la visualización del Spinner
  public isLoading = signal<boolean>(false);
  public conceptTitle = signal<string>('');

  public aniosPago = [
    {name: '2020', value:'p2020'},
    {name: '2021', value:'p2021'},
    {name: '2022', value:'p2022'},
    {name: '2023', value:'p2023'},
    {name: '2024', value:'p2024'},
  ]//: Array<any> = [];

  public anio = signal<number>(new Date().getFullYear());

  public messages: Messages[] = [];
  public messages_other: Messages[] = [];

  private checkboxControl!: Subscription;


  private breakpointObserver = inject(BreakpointObserver);
  private validatorsService = inject(SmytValidatorService);
  private smytService = inject(SmytService);
  private genralService = inject(GeneralesService);
  private router = inject(Router);
  private _snackBar = inject(MatSnackBar);

  public step = signal<number>(0);

  //Intanciaa de un objeto de tipo FormBuilder
  private fb = inject(FormBuilder);
  public myForm: FormGroup = this.fb.group({
    modelo: ['', [Validators.required, Validators.max(this.anio() + 1), Validators.min(AnioMin.ANIOMIN_VEHICLE)]], // Entre 1900 - 2024
    procedencia: ['NACIONAL', [Validators.required]], // Nacional, Extranjero
    //uso_vehiculo: [''], // se infiere que es particular
    //cilindros: ['', [Validators.required, Validators.max(16), Validators.pattern(this.validatorsService.numberPattern)]],
    //centimetros: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(this.validatorsService.numberPattern)]],
    pasajeros: ['', [Validators.required]],
    tonelaje: ['', [Validators.required]],
    //valor_factura: ['', [Validators.required, Validators.pattern(this.validatorsService.numberPattern)]],
    placa_foranea: ['', [Validators.required]],
    pago_baja_f: ['1', [Validators.required]],
    pagos: this.fb.array(this.aniosPago.map(x => false)),
    fecha_enajenacion: [new Date(),[Validators.required]],
    fecha_solicitud: [new Date(),[Validators.required]],
    fecha_aprobacion: [new Date(),[Validators.required]],
    
  });

  public sizeDisplay!: string;
  destroyed = new Subject<void>();
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  @ViewChild(DataVehicleComponent)
  private childComponent!: DataVehicleComponent;

  @ViewChild('accordion', { static: true })
  public Accordion!: MatAccordion;

  @HostListener('input', ['$event']) onKeyUp(event: any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  //Metodo sincrono que devuelve un valor especifico con formato, en este caso devuelve parte del Form por referencia como un FormArray
  get ordersFormArray() {
    return this.myForm.controls['pagos'] as FormArray;
  }

  constructor() {
    /*const currentYear = new Date();
    for (let index = 5; index >= 1; index--) {
      this.aniosPago.push({name:currentYear.getFullYear()-index,value:currentYear.getFullYear()-index})
    }*/

    this.mediaQuery();
  }

  ngOnInit(): void {

    //Obtiene el Nombre del concepto que se requiere procesar
    this.conceptTitle.set(sessionStorage.getItem('concept')!);
    let msg: string = '';
    //Llamado al sevico para obtener los mensajes a mostrar
    this.genralService.getMessages()
      .subscribe(message => {
        this.messages = message;
        if (this.sizeDisplay === 'Small' || this.sizeDisplay === 'XSmall') {
          this.messages.forEach(mss => {
            msg += mss.message + "<br><br>";
          });
          this.openSnackBar(msg);
        }
      });

    // Observable de los cambios suscitado en el apartado del formulario "pagos" y modifica el valor del elemento,
    //que en un inicio es FALSE por el valor del arreglo
    this.checkboxControl = this.ordersFormArray.valueChanges.subscribe(checkbox => {
      this.ordersFormArray.setValue(
        this.ordersFormArray.value.map((value: any, i: any) => value ? this.aniosPago[i].value : false),
      );
    });

  }

  updateFiel(event: number): void {
    if (event === 8) {
      this.myForm.get('centimetros')?.enable();
      this.myForm.get('cilindros')?.disable();
      return;
    }
    if (event === 7) {
      let msg: string = '';
      this.validatorsService.getMessages_vehicle()
        .subscribe(message => {
          this.messages_other = message;
          if (this.sizeDisplay === 'Small' || this.sizeDisplay === 'XSmall') {
            this.messages_other.forEach(mss => {
              msg += mss.message + "<br><br>";
            });
            this.openSnackBar(msg);
          }
        });
      return;
    }

    if (this.messages_other.length > 0) this.messages_other = [];

    if (this.myForm.get('centimetros')?.enabled) this.myForm.get('centimetros')?.disable();

    if (this.myForm.get('cilindros')?.disabled) this.myForm.get('cilindros')?.enable();

    return;
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.myForm.addControl('primary_form', this.childComponent.myFormSmyt);
      this.childComponent.myFormSmyt.setParent(this.myForm);

      this.myForm.markAllAsTouched();

      this.myForm.get('primary_form')!.get('valor_venta')!.enable();
      this.myForm.get('primary_form')!.get('tipo_vehiculo')!.enable();
      this.myForm.get('primary_form')!.get('serie')!.enable();
      this.myForm.get('primary_form')!.get('seriesec')!.enable();
      this.myForm.get('primary_form')!.get('fecha_factura')!.enable();
      this.myForm.get('primary_form')!.get('valor_factura')!.enable();
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroyed.unsubscribe();
    this.checkboxControl.unsubscribe();
  }

  setStep(index: number): void {
    this.step.set(index);
  }

  isValidField(field: string) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField(this.myForm, field);
  }

  calcularPago() {
    this.isLoading.set(true);
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      this.Accordion.openAll();
      this.isLoading.set(false);
      return;
    }
    let invoiceDate = moment(this.myForm.get('primary_form')?.get('fecha_factura')?.value).toDate();
    let solicitudData = moment(this.myForm.get('fecha_solicitud')?.value).toDate();
    let aprobacionData = moment(this.myForm.get('fecha_aprobacion')?.value).toDate();
    let enajenacionDate = moment(this.myForm.get('fecha_enajenacion')?.value).toDate();

    //let pagos: any[] = this.myForm.get('pagos')?.value;
    //pagos = pagos.filter(r => r !== false );

    let pagosRealizados: string = '';
    this.ordersFormArray.value.map((value: string, i:any)  =>{
      if(!!value) {
        pagosRealizados += value.substring(1) + ','
      }
    })
    //this.fb.array(this.aniosPago.map(x => false))
    let parameters: DatosTramite = {
      tramite: 8,
      placa: '',
      numeroSerie: this.myForm.get('primary_form')?.get('serie')?.value,
      tipoVehiculo: this.myForm.get('primary_form')?.get('tipo_vehiculo')?.value,
      obtenerContribuyente: false,
      fechaFactura: invoiceDate.getDate() + '/' + (invoiceDate.getMonth() + 1) + '/' + invoiceDate.getFullYear(),
      modelo: this.myForm.get('modelo')?.value,
      valorFactura: this.myForm.get('primary_form')?.get('valor_factura')?.value,
      valorVenta: this.myForm.get('primary_form')?.get('valor_venta')?.value,
      pagoBaja: this.myForm.get('pago_baja_f')?.value,
      pagosRealizados: pagosRealizados,
      claveVehicular: "",/* TOTO: NO SE UTILIZA , PERO EN ALGUN MOMENTO SE PODRIA HABILITAR. AGREGAR EL COAMPO EN EL FORM-ALTA-VEHICULO*/
      tipoMotor: this.myForm.get('primary_form')?.get('tipo_motor')?.value,

      fechaSolicitud: solicitudData.getDate() + '/' + (solicitudData.getMonth() + 1) + '/' + solicitudData.getFullYear(),
      fechaAprobacion: aprobacionData.getDate() + '/' + (aprobacionData.getMonth() + 1) + '/' + aprobacionData.getFullYear(),
      fechaEnajenacion: enajenacionDate.getDate() + '/' + (enajenacionDate.getMonth() + 1) + '/' + enajenacionDate.getFullYear(),
      capacidadPasajeros: this.myForm.get('pasajeros')?.value,
      tonelaje: this.myForm.get('tonelaje')?.value,
      
    }
    sessionStorage.setItem('vehicle_data', JSON.stringify(parameters));

    sessionStorage.setItem('vehicle_data_adicional', JSON.stringify({
      "capacidadPasajeros": this.myForm.get('pasajeros')?.value,
      "tonelaje": this.myForm.get('tonelaje')?.value,
      "centimetrosCubicos": this.myForm.get('centimetros')?.value,
      "noCilindros": this.myForm.get('cilindros')?.value,
      "procedencia": this.myForm.get('procedencia')?.value
    }))

    this.smytService.validateVehicle(parameters)
      .subscribe(resp => {
        if (resp?.success) {
          this.router.navigate(['/pagos/tabla-conceptos', 1]);
          return
        }
        this._snackBar.openFromComponent(SnackBarComponent, {
          data: resp?.data,
          duration: 3000, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
        });

        this.isLoading.set(false);
      });
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

  openSnackBar(message: string) {

    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message, duration: 15000, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
    });
  }
}
