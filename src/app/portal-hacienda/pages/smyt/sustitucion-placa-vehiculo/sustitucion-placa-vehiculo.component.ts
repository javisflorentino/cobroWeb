import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

import ListMessageSmyt from '../../../../../../data/arreglos/smyt_mensajes.json'
import ListaOficinas from '../../../../../../data/arreglos/smyt_oficinas_tramite.json';
import ListaTipoVehiculo from '../../../../../../data/arreglos/smyt_tipo_vehiculo.json';

import { Oficinas } from 'src/app/portal-hacienda/interface/portal-oficinas.interface';
import { Subject, takeUntil } from 'rxjs';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';
import { TipoVehiculo } from 'src/app/portal-hacienda/interface/portal-tipovehiculo.interface';
import { DatosTramite } from 'src/app/shared/interfaces/datos-tramite.interface';
import moment from 'moment';

@Component({
  selector: 'smyt-sustitucion-placa-vehiculo',
  templateUrl: './sustitucion-placa-vehiculo.component.html',
  styles: [
  ]
})
export class SustitucionPlacaVehiculoComponent implements OnInit {
  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  public myForm: FormGroup = this.fb.group({
    oficina: ['', [Validators.required]],
    tipo_vehiculo: ['',[Validators.required]],
    placa:   ['', [Validators.required, Validators.minLength(4)]],
    serie:   ['', [Validators.required]],
    fecha_factura: [new Date(),[Validators.required, this.validatorsService.cantBeGreat]]
  },
  {
    validators: [this.validatorsService.existsSeries('serie','placa',1, 5, '1','fecha_factura')]
  });

  public messages: Messages[] = [];
  public messages_other: Messages[] = [];
  public mssgArr: MessageSmyt[] = ListMessageSmyt.smyt_baja;
  /* Arreglo de oficinas de SMyT */
  public oficinasArr: Oficinas[] = ListaOficinas;
  //declaracion de variable de tipo TipoVehiculo y se le agrega el arreglo
  public tipoVehiculoArr: TipoVehiculo[] = ListaTipoVehiculo;

  public conceptTitle: string = '';

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

  constructor( private fb: FormBuilder,
    private validatorsService: ValidatorsService,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
    private smytService: SmytService,
    private router: Router
  ){
    this.mediaQuery();
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

  getMessage(idMssg:number, nameField:string) {
    let touched = this.myForm.get(nameField)?.touched;
    let nameFileValue = this.myForm.get(nameField)?.value;
    let pathSelect = this.validatorsService.alfaPath;

    if(idMssg !== null) {
      const message = this.mssgArr.filter(({id}) => id == idMssg );
      return message[0].msg;
    }
    if( touched ) {
      let idMessage=100;

      let pattern = new RegExp(pathSelect);
      if(!pattern.test(nameFileValue) || nameFileValue == null) {
        const message = this.mssgArr.filter(({id}) => id == idMessage );
        this.myForm.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );
        return message[0].msg;
      }

    }
    return '';
  }

  updateFiel(event: number): void {
    console.log(event)
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
    return;
  }

  onSubmit() {
    this.isLoading = true;
    this.buttBlock = true;
    if ( this.myForm.invalid ) {
      this.myForm.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }

    let p = this.myForm.get('placa')!.value;
    let s = this.myForm.get('serie')?.value;
    let invoiceDate = moment(this.myForm.get('fecha_factura')?.value).toDate();

    let parameters: DatosTramite = {
      tramite:              5,
      placa:                p,
      numeroSerie:          s,
      tipoVehiculo:         this.myForm.get('tipo_vehiculo')?.value,
      obtenerContribuyente: true,
      fechaFactura:         invoiceDate.getDate() + '/' + (invoiceDate.getMonth()+1) + '/' + invoiceDate.getFullYear(),
      obtenerVehiculo:      true
    }

    //Llamar Servicio para ovtener datos del vehiculo y almacenarlo en LocalStor
    localStorage.setItem('vehicle_data', JSON.stringify(parameters));
    this.smytService.validateVehicle(parameters)
      .subscribe(resp => {
        if (resp?.success) {
          localStorage.setItem('vehicle_data_adicional', JSON.stringify({
            "vMarca":        resp.data.adicional?.vMarca,
            "vSubmarca":     resp.data.adicional?.vSubmarca,
            "noCilindros":   resp.data.adicional?.noCilindros,
            "placaAnterior": resp.data.adicional?.placaAnterior,
            "modelo":        resp.data.adicional?.modelo,
            "tipoVehiculo":  resp.data.adicional?.tipoVehiculo
          }));
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
}
