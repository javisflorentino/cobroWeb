import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterContentInit, Component, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DataVehicleComponent } from 'src/app/portal-hacienda/components/smyt/data-vehicle/data-vehicle.component';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';

import ListMessageSmyt from '../../../../../../data/arreglos/smyt_mensajes.json';
import moment from 'moment';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';

@Component({
  selector: 'app-sustitucion-placa-cambio-propietario',
  templateUrl: './sustitucion-placa-cambio-propietario.component.html',
  styleUrls: ['./sustitucion-placa-cambio-propietario.component.css']
})
export class SustitucionPlacaCambioPropietarioComponent implements OnInit, AfterContentInit, OnDestroy {
  private fb = inject(FormBuilder);
  private smytService = inject(SmytService);
  private generalService = inject(GeneralesService);
  private router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private breakpointObserver = inject(BreakpointObserver);

  public conceptTitle = signal<string>('');

  public myForm: FormGroup = this.fb.group({});

  @ViewChild(DataVehicleComponent)
  private childComponent!: DataVehicleComponent;

  public sizeDisplay!: string;
  destroyed = new Subject<void>();
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  public messages: Messages[] = [];
  public messages_other: Messages[] = [];
  public mssgArr: MessageSmyt[] = ListMessageSmyt.smyt_baja;

  @HostListener('input', ['$event']) onKeyUp(event: any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  constructor() {
    this.mediaQuery();
  }

  ngOnInit(): void {
    this.conceptTitle.set(sessionStorage.getItem('concept')!);
    let msg: string = '';
    this.generalService.getMessages()
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

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.myForm.addControl('primary_form', this.childComponent.myFormSmyt);
      this.childComponent.myFormSmyt.setParent(this.myForm);

      this.myForm.markAllAsTouched();

      this.myForm.get('primary_form')!.get('placa')!.enable();
      this.myForm.get('primary_form')!.get('serie')!.enable();
      this.myForm.get('primary_form')!.get('valor_venta')!.enable();
      this.myForm.get('primary_form')!.get('tipo_vehiculo')!.enable();
      this.myForm.get('primary_form')!.get('fecha_factura')!.enable();
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroyed.unsubscribe();
  }

  onSubmit(): void {
    //this.isLoading.set = true;
    if (this.myForm.invalid) {
      //this.isLoading = false;
      return;
    }
    let invoiceDate = moment(this.myForm.get('primary_form')?.get('fecha_factura')?.value).toDate();
    const reqData = {
      "placa": this.myForm.get('primary_form')?.get('placa')?.value,
      "tramite": 9,
      "tipoVehiculo": this.myForm.get('primary_form')?.get('tipo_vehiculo')?.value,
      "numeroSerie": this.myForm.get('primary_form')?.get('serie')?.value,
      "valorVenta": this.myForm.get('primary_form')?.get('valor_venta')?.value,
      "fechaFactura": invoiceDate.getDate() + '/' + (invoiceDate.getMonth() + 1) + '/' + invoiceDate.getFullYear(),
      "obtenerContribuyente": true
    }
    sessionStorage.setItem('vehicle_data', JSON.stringify(reqData));
    //console.log(reqData)
    this.smytService.validateVehicle(reqData)
      .subscribe(resp => {
        if (resp?.success) {
          this.router.navigate(['/pagos/tabla-conceptos', 1]);
          return
        }
        this._snackBar.openFromComponent(SnackBarComponent, {
          data: resp?.data,
          duration: 3000, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
        });

        //this.isLoading = false;
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
