import { Component, ViewChild, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject, Subscription, takeUntil } from 'rxjs';
import { FormAltaVehiculoComponent } from 'src/app/portal-hacienda/components/smyt/form-alta-vehiculo/form-alta-vehiculo.component';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

import { AnioMin } from 'src/app/portal-hacienda/interface/portal_genericas.interfacce';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';
import { MatAccordion } from '@angular/material/expansion';
import moment from 'moment';
import { DatosTramite } from 'src/app/shared/interfaces/datos-tramite.interface';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'smyt-alta-vehiculo-usado-page',
  templateUrl: './alta-vehiculo-usado-page.component.html',
  styles: [
  ],
})
export class AltaVehiculoUsadoPageComponent implements OnDestroy, AfterViewInit {

  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  public step: number = 0;

  aniosPago = [
    {name: '2021', value:'p2021'},
    {name: '2022', value:'p2022'},
    {name: '2023', value:'p2023'},
    {name: '2024', value:'p2024'},
    {name: '2025', value:'p2025'}
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
    //cilindros:    [ '', [ Validators.required, Validators.max(16), Validators.pattern(this.validatorService.numberPattern)] ],
    //centimetros:  [ {value: '', disabled: true}, [Validators.required, Validators.pattern(this.validatorService.numberPattern)]],
    tonelaje:  [ {value: '', disabled: true}, [Validators.required, Validators.pattern(this.validatorService.numberPattern)]],
    pasajeros:    [ '', [ Validators.required] ],
    //valor_factura:[ '', [ Validators.required, Validators.pattern(this.validatorService.numberPattern)]],
    placa_foranea:[ '', [ Validators.required] ],
    pago_baja_f:  [ '2', [Validators.required] ],
    //fecha_enajenacion: [new Date(),[Validators.required]],
    fecha_solicitud: [new Date(),[Validators.required]],
    fecha_aprobacion: [new Date(),[Validators.required]],
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


  public sizeDisplay!: string;
  destroyed = new Subject<void>();
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  @ViewChild('accordion',{static:true})
  public Accordion!: MatAccordion;


  //Metodo sincrono que devuelve un valor especifico con formato, en este caso devuelve parte del Form por referencia como un FormArray
  get ordersFormArray() {
    return this.myForm.controls['pagos'] as FormArray;
  }

  @HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  constructor(
    private fb: FormBuilder,
    private smytService: SmytService,
    private validatorService: ValidatorsService,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {
    this.mediaQuery();
  }

  // Se implementó para la carga del formulario FormAltaVehiculoComponent
  ngAfterViewInit(): void {
    setTimeout( () => {
      this.myForm.addControl('oficinas',this.childComponent.myFormShared);
      this.childComponent.myFormShared.setParent(this.myForm);
    });

    //this.openSnackBar(message: string)

  }

  ngOnInit(): void {
     Swal.fire({
          title: "Términos y Condiciones",
          html:
            `<div id="nota_1" style="color:red; margin-left: 20px;">
              <div class="alert alert-danger">
                <p><b>Nota: </b>El pago de este trámite no le garantiza la obtención satisfactoria del mismo, si no cumple con los requisitos solicitados por la Coordinación General de Movilidad y Transporte.</p>
              </div>
            </div>
            <br>
            <div id="nota_3" style="color:red; margin-left: 20px;">
              <div class="alert alert-danger">
                <p><b>Nota: </b>La información presentada es una aproximación del costo de los trámites, tomando como referencia la información capturada en el formulario; Esta puede variar según la validación del personal de la Coordinación General de Movilidad y Transporte al momento de realizar su trámite.</p>
              </div>
            </div>
            `,

          showCancelButton: true,
          confirmButtonText: "De acuerdo",
          customClass: {
            confirmButton: 'custom-confirm-button', // Clase personalizada para el botón de confirmación
          },

          allowOutsideClick: false
        }).then((result) => {
          if (!result.isConfirmed) {
            this.router.navigate(['/pagos/dependencias'])
          }
        });

    //Obtiene el Nombre del concepto que se requiere procesar
    this.conceptTitle = sessionStorage.getItem('concept')!;
    let msg: string = '';
    //Llamado al sevico para obtener los mensajes a mostrar
    this.smytService.getMessages()
      .subscribe( message => {
        this.messages = message;
        if (this.sizeDisplay === 'Small' || this.sizeDisplay === 'XSmall') {
          this.messages.forEach(mss=> {
            msg += mss.message + "<br><br>";
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
    console.log(event)
    if (event === 3) {
      this.myForm.get('centimetros')?.enable();
      this.myForm.get('cilindros')?.disable();
      this.myForm.get('tonelaje')?.enable();
      return;
    }
    if(event === 9) {
      let msg: string = '';
      this.smytService.getMessages_vehicle()
        .subscribe( message => {
          this.messages_other = message;
          if (this.sizeDisplay === 'Small' || this.sizeDisplay === 'XSmall') {
            this.messages_other.forEach(mss=> {
              msg += mss.message + "<br><br>";
            });
            this.openSnackBar(msg);
          }
        });
      return;
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
    return this.myForm.get('oficinas')?.disable;
  }

  isValidField( field: string ) {
    //TODO: Obtener validación desde un servicio
    return this.validatorService.isValidField( this.myForm, field );
  }

  // Metodo que se encarga de llamar al servicio para calcular el monto a pagar y redireccionar a componente correspondiente
  calcularPago() {
    let pagosRealizados: string = '';
    this.ordersFormArray.value.map((value: string, i:any)  =>{
      if(!!value) {
        pagosRealizados += value.substring(1) + ','
      }
    })
    this.isLoading = true;
    this.buttBlock = true;

    if ( this.myForm.invalid ) {
      this.myForm.markAllAsTouched();
      this.Accordion.openAll();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }
    let invoiceDate = moment(this.myForm.get('oficinas')?.get('fecha_factura')?.value).toDate();
    let solicitudData = moment(this.myForm.get('fecha_solicitud')?.value).toDate();
    let aprobacionData = moment(this.myForm.get('fecha_aprobacion')?.value).toDate();
    //let enajenacionDate = moment(this.myForm.get('fecha_enajenacion')?.value).toDate();

    sessionStorage.setItem('vehicle_data', JSON.stringify({"placa":'',"numeroSerie":String(this.myForm.get('oficinas')?.get('no_serie')?.value).toUpperCase(),"tramite":6,
      "tipoVehiculo":this.myForm.get('oficinas')?.get('tipo_vehiculo')?.value, "fechaFactura":invoiceDate.getDate() + '/' + (invoiceDate.getMonth()+1) + '/' + invoiceDate.getFullYear(),
      "obtenerContribuyente":false,"modelo":this.myForm.get('modelo')?.value,"valorFactura":this.myForm.get('oficinas')?.get('valor_factura')?.value,
      "placaAnterior":String(this.myForm.get('placa_foranea')?.value).toUpperCase(), "pagoBaja":this.myForm.get('pago_baja_f')?.value,"pagosRealizados":pagosRealizados,
      "fechaSolicitud": solicitudData.getDate() + '/' + (solicitudData.getMonth() + 1) + '/' + solicitudData.getFullYear(),
      "fechaAprobacion": aprobacionData.getDate() + '/' + (aprobacionData.getMonth() + 1) + '/' + aprobacionData.getFullYear(),
      "tonelaje": this.myForm.get('tonelaje')?.value,"capacidadPasajeros":this.myForm.get('pasajeros')?.value
    }));

    sessionStorage.setItem('vehicle_data_adicional',JSON.stringify({
      "capacidadPasajeros":this.myForm.get('pasajeros')?.value,
      "centimetrosCubicos":this.myForm.get('centimetros')?.value,
      "noCilindros":this.myForm.get('cilindros')?.value,
      "procedencia":this.myForm.get('procedencia')?.value
    }))

      let parameters: DatosTramite = {
        tramite:              2,
        placa:                '',
        placaAnterior:                this.myForm.get('placa_foranea')?.value,
        numeroSerie:          this.myForm.get('oficinas')?.get('no_serie')?.value,
        tipoVehiculo:         this.myForm.get('oficinas')?.get('tipo_vehiculo')?.value,
        obtenerContribuyente: false,
        fechaFactura:         invoiceDate.getDate() + '/' + (invoiceDate.getMonth()+1) + '/' + invoiceDate.getFullYear(),
        modelo:               this.myForm.get('modelo')?.value,
        valorFactura:         this.myForm.get('oficinas')?.get('valor_factura')?.value,//this.myForm.get('valor_factura')?.value
        claveVehicular:       "",/* TOTO: NO SE UTILIZA , PERO EN ALGUN MOMENTO SE PODRIA HABILITAR. AGREGAR EL COAMPO EN EL FORM-ALTA-VEHICULO*/
        tipoMotor:            this.myForm.get('oficinas')?.get('tipo_motor')?.value,

        fechaSolicitud: solicitudData.getDate() + '/' + (solicitudData.getMonth() + 1) + '/' + solicitudData.getFullYear(),
        fechaAprobacion: aprobacionData.getDate() + '/' + (aprobacionData.getMonth() + 1) + '/' + aprobacionData.getFullYear(),
        tonelaje: this.myForm.get('tonelaje')?.value,
        capacidadPasajeros: this.myForm.get('pasajeros')?.value,
        //fechaEnajenacion: enajenacionDate.getDate() + '/' + (enajenacionDate.getMonth() + 1) + '/' + enajenacionDate.getFullYear()
      }

      this.smytService.validateVehicle(parameters)
      .subscribe({
        next:(resp)=>{
          if (resp?.success) {
            this.router.navigate(['/pagos/tabla-conceptos',1]);
            return
          }
          Swal.fire({icon: "error", title: "Error!!", text: resp?.data.toString(), allowOutsideClick:false});
          this.isLoading = false;
          this.buttBlock = false;
        },
        error: (err)=>{
          Swal.fire({icon: "error", title: "Error!!", text: err.message, allowOutsideClick:false});
          this.isLoading = false;
          this.buttBlock = false;
        }
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

  setStep(index: number): void {
    this.step = index;
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 15000,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }
}
