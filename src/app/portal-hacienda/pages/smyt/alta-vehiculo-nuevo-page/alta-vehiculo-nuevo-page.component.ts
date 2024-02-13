import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

@Component({
  selector: 'smyt-alta-vehiculo-nuevo-page',
  templateUrl: './alta-vehiculo-nuevo-page.component.html',
  styles: [
  ]
})
export class AltaVehiculoNuevoPageComponent implements OnInit, AfterViewInit {

  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  public myForm: FormGroup = this.fb.group({});

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

  @HostListener('input', ['$event']) onKeyUp(event:any) {
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
    setTimeout( () => {
      this.myForm.addControl('oficina_tramite',this.childComponent.myFormShared);
      this.childComponent.myFormShared.setParent(this.myForm);
    });
    //form.setParent(this.form);
  }

  ngOnInit(): void {
    this.conceptTitle = localStorage.getItem('concept')!;
    let msg: string = '';
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
  }

  get recibeForm() {
    return null;
  }

  calcularPago() {
    this.isLoading = true;
    this.buttBlock = true;
    if ( this.myForm.invalid ) {
      this.myForm.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }


    let invoiceDate = moment(this.myForm.get('oficina_tramite')?.get('fecha_factura')?.value).toDate();

    localStorage.setItem('vehicle_data', JSON.stringify({"placa":'',"numeroSerie":String(this.myForm.get('oficina_tramite')?.get('no_serie')?.value).toUpperCase(),"tramite":2,
      "tipoVehiculo":this.myForm.get('oficina_tramite')?.get('tipo_vehiculo')?.value, "fechaFactura":invoiceDate.getDate() + '/' + (invoiceDate.getMonth()+1) + '/' + invoiceDate.getFullYear(),
      "obtenerContribuyente":false}));

    let parameters: DatosTramite = {
      tramite:              2,
      placa:                '',
      numeroSerie:          this.myForm.get('oficina_tramite')?.get('no_serie')?.value,
      tipoVehiculo:         this.myForm.get('oficina_tramite')?.get('tipo_vehiculo')?.value,
      obtenerContribuyente: false,
      fechaFactura:         invoiceDate.getDate() + '/' + (invoiceDate.getMonth()+1) + '/' + invoiceDate.getFullYear()
    }

    this.smytService.validateVehicle(parameters)
      .subscribe(resp => {
        if (resp?.success) {
          //localStorage.setItem('datos_cobro',JSON.stringify({sistema: 64}));
          //localStorage.setItem('route_origen','smyt/smyt-altavehiculo-nuevo')
          this.router.navigate(['/pagos/tabla-conceptos',1]);
          return
        }
        this._snackBar.openFromComponent(SnackBarComponent, {
          data: resp?.data,
          duration: 3000,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
        });

        this.isLoading = false;
        this.buttBlock = false;
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
      data: message,duration: 15000,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }

  updateFiel(event: number): void {
    if(event === 7) {
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
    }
    if(this.messages_other.length > 0) this.messages_other = [];
    return;
  }


}
