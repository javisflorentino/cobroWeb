import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { FormAltaVehiculoComponent } from 'src/app/portal-hacienda/components/smyt/form-alta-vehiculo/form-alta-vehiculo.component';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '../../../../shared/components/snack-bar/snack-bar.component';
import { DatosTramite } from 'src/app/shared/interfaces/datos-tramite.interface';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { AnioMin } from 'src/app/portal-hacienda/interface/portal_genericas.interfacce';

@Component({
  selector: 'smyt-alta-vehiculo-nuevo-page',
  templateUrl: './alta-vehiculo-nuevo-page.component.html',
  styleUrls: ['./alta-vehiculo-nuevo-page.component.css']
})
export class AltaVehiculoNuevoPageComponent implements OnInit, AfterViewInit {

  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  public anio: number = new Date().getFullYear();

  public myForm: FormGroup = this.fb.group({
    modelo: ['', [Validators.required, Validators.max(this.anio + 1), Validators.min(AnioMin.ANIOMIN_VEHICLE)]], // Entre 1900 - 2024
    //cilindros: ['', [Validators.required, Validators.max(16), Validators.pattern(this.validatorsService.numberPattern)]],
    //centimetros: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(this.validatorsService.numberPattern)]],
    pasajeros: ['', [Validators.required]],
    fecha_solicitud: [new Date(), [Validators.required, this.validatorsService.cantBeGreat]],
    fecha_aprobacion: [new Date(), [Validators.required, this.validatorsService.cantBeGreat]],
  });

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

  @HostListener('input', ['$event']) onKeyUp(event: any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  constructor(
    private fb: FormBuilder,
    private smytService: SmytService,
    private validatorsService: ValidatorsService,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {
    this.mediaQuery();
  }

  // Se implementó para la carga del formulario FormAltaVehiculoComponent
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.myForm.addControl('oficina_tramite', this.childComponent.myFormShared);
      this.childComponent.myFormShared.setParent(this.myForm);
    });
    //form.setParent(this.form);
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
      if (result.isConfirmed) {

      } else {
        this.router.navigate(['/pagos/dependencias'])
      }
    });



    this.conceptTitle = localStorage.getItem('concept')!;
    let msg: string = '';
    this.smytService.getMessages()
      .subscribe(message => {
        this.messages = message;
        if (this.sizeDisplay === 'Small' || this.sizeDisplay === 'XSmall') {
          this.messages.forEach(mss => {
            msg += mss.message + "<br><br>";
          });
          this.openSnackBar(msg);
        }
      });
  }

  get recibeForm() {
    return null;
  }

  calcularPago() {
    this.isLoading = true;
    this.buttBlock = true;
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }


    let invoiceDate = moment(this.myForm.get('oficina_tramite')?.get('fecha_factura')?.value).toDate();
    let solicitudData = moment(this.myForm.get('fecha_solicitud')?.value).toDate();
    let aprobacionData = moment(this.myForm.get('fecha_aprobacion')?.value).toDate();

    /* TODO: 16012025 .- SE AGREGA LOS DOS ULTIMOS PARAMETROS CLAVEVEHICULA Y TIPOMOTOR */
    localStorage.setItem('vehicle_data', JSON.stringify({
      "placa": '', "numeroSerie": String(this.myForm.get('oficina_tramite')?.get('no_serie')?.value).toUpperCase(), "tramite": 2,
      "tipoVehiculo": this.myForm.get('oficina_tramite')?.get('tipo_vehiculo')?.value, "fechaFactura": invoiceDate.getDate() + '/' + (invoiceDate.getMonth() + 1) + '/' + invoiceDate.getFullYear(),
      "obtenerContribuyente": false, "claveVehicular": '', "tipoMotor": this.myForm.get('oficina_tramite')?.get('tipo_motor')?.value, "fechaSolicitud": solicitudData.getDate() + '/' + (solicitudData.getMonth() + 1) + '/' + solicitudData.getFullYear(),
      "fechaAprobacion": aprobacionData.getDate() + '/' + (aprobacionData.getMonth() + 1) + '/' + aprobacionData.getFullYear(),
      "capacidadPasajeros": this.myForm.get('pasajeros')?.value, "modelo": this.myForm.get('modelo')?.value,
      "valorFactura": this.myForm.get('oficina_tramite')?.get('valor_factura')?.value
    }));

    let parameters: DatosTramite = {
      tramite: 2,
      placa: '',
      numeroSerie: this.myForm.get('oficina_tramite')?.get('no_serie')?.value,
      tipoVehiculo: this.myForm.get('oficina_tramite')?.get('tipo_vehiculo')?.value,
      obtenerContribuyente: false,
      fechaFactura: invoiceDate.getDate() + '/' + (invoiceDate.getMonth() + 1) + '/' + invoiceDate.getFullYear(),
      claveVehicular: "",/* TOTO: NO SE UTILIZA , PERO EN ALGUN MOMENTO SE PODRIA HABILITAR. AGREGAR EL COAMPO EN EL FORM-ALTA-VEHICULO*/
      tipoMotor: this.myForm.get('oficina_tramite')?.get('tipo_motor')?.value,

      fechaSolicitud: solicitudData.getDate() + '/' + (solicitudData.getMonth() + 1) + '/' + solicitudData.getFullYear(),
      fechaAprobacion: aprobacionData.getDate() + '/' + (aprobacionData.getMonth() + 1) + '/' + aprobacionData.getFullYear(),
      capacidadPasajeros: this.myForm.get('pasajeros')?.value,
      modelo: this.myForm.get('modelo')?.value,
      valorFactura: this.myForm.get('oficina_tramite')?.get('valor_factura')?.value
    }

    this.smytService.validateVehicle(parameters)
      .subscribe({
        next: (resp) => {
          if (resp?.success) {
            this.router.navigate(['/pagos/tabla-conceptos', 1]);
            return
          }
          Swal.fire({ icon: "error", title: "Error!!", text: resp?.data.toString(), allowOutsideClick: false });
          this.isLoading = false;
          this.buttBlock = false;
        },
        error: (err) => {
          Swal.fire({ icon: "error", title: "Error!!", text: err.message, allowOutsideClick: false });
          this.isLoading = false;
          this.buttBlock = false;
        },
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

  updateFiel(event: number): void {
    if (event === 3) {
      this.myForm.get('centimetros')?.enable();
      this.myForm.get('cilindros')?.disable();
      return;
    }
    if (event === 9) {
      let msg: string = '';
      this.smytService.getMessages_vehicle()
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
    return;
  }

  isValidField(field: string) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField(this.myForm, field);
  }

}
