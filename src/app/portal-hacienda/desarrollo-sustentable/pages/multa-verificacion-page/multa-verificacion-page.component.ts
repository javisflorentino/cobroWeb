import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

import ListMessageDesarrollo from '../../../../../../data/arreglos/desarrolloS_messages.json';
import { Concepto } from '../../../interface/portal-calculo-concepto.interface';
import moment from 'moment';
import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
import { ValidateVehicle } from 'src/app/shared/interfaces/soap-valid-vehicle.interface';
import { ConvertXmlString } from 'src/app/shared/clases/convert-xml-string';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';

@Component({
  selector: 'desarrollos-multa-verificacion-page',
  templateUrl: './multa-verificacion-page.component.html',
  styles: []
})
export class MultaVerificacionPageComponent implements OnInit, OnDestroy {

  /* Inyeccion del servicio donde se aplican las validaciones de campos del FORM */
  private validatorsService = inject( ValidatorsService );
  private generalService = inject( GeneralesService );

  /* Inyeccion de la depoendencia encargada de formularios */
  private fb = inject( FormBuilder );
  public myForm: FormGroup = this.fb.group({
    placa:              ['', [Validators.required, Validators.minLength(4)]],
    fecha_verificacion: [new Date, [Validators.required]],
    serie:              ['', [Validators.required, Validators.minLength(5)]]
  },{
    validators: [this.generalService.validateVahicle('serie','placa',1, 1, '1','')]
  });

  /* ACCEDER A LAS REDIRECCIONES */
  private router = inject( Router );

  /* MANEJO DE INFORMACION RECIBIDA POR LA URL */
  private activateRaute = inject( ActivatedRoute );
  private ActivatedRouteSubscribe!: Subscription;

  private _snackBar = inject(MatSnackBar);

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  /* Se usa para obtener el nombre del concepto seleccionado y mostrarlo en el HTML */
  public nameConcept: string = '';

  public mssgArr: MessageSmyt[] = ListMessageDesarrollo.calidad_aire_certificacionver;

  //Se obtiene una referencia a todo el componente que se renderizó en este componente. Se uso el nombre del componente
  private idConcepto: number = 0;
  private tipoForm: number = 0;

  /* CONTROLA EL NOMBRE DEL CONCEPTO Y MOSTRARLO EN HTML */
  public conceptTitle: string = '';

  private asJson!:ValidateVehicle;
  private xmlSring: ConvertXmlString = new ConvertXmlString();

  /* CONVIERTE A MAYUSCULAS */
  @HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }


  ngOnInit(): void {
    this.ActivatedRouteSubscribe = this.activateRaute.params.subscribe(({idConcepto,tipoForm}) => {
      this.idConcepto = idConcepto;
      this.tipoForm = tipoForm;
      this.conceptTitle = localStorage.getItem('concept')!;
    });
  }

  ngOnDestroy(): void {
    this.ActivatedRouteSubscribe?.unsubscribe();
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
    this.generalService.validateVahicleOnDb(this.myForm.get('placa')?.value, this.myForm.get('serie')?.value)
    .then(response => response.text())
    .then(xml => {
      this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
      const response = this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'];
      if(response.includes('EXITO')) {
        const fecha = moment(this.myForm.get('fecha_verificacion')?.value);
        localStorage.setItem('route_origen',`desarrollo-sustentable/calidad-aire-multaverif/${this.idConcepto}/${this.tipoForm}`);
        localStorage.setItem('datos_cobro',JSON.stringify(
          {
            cantidad:           1,
            monto:              1,
            idConcepto:         this.idConcepto,
            placa:               this.myForm.get('placa')?.value,
            serie:              this.myForm.get('serie')?.value,
            fecha_verificacion: fecha.format('YYYY-MM-DD'),//fecha.getFullYear() + '-' + (fecha.getMonth()+1) + '-' + fecha.getDay(),
            tipo_form:          this.tipoForm
          })
        )

        this.router.navigate(['/pagos/tabla-conceptos',this.idConcepto,this.tipoForm]);
        return;
      }
      this.openSnackBar(response);
      this.isLoading = false;
      this.buttBlock = false;
    });

    //return;
  }

  getMessage(idMssg:ValidationErrors|null|undefined, nameField:string) {
    if ( !idMssg ) {
      return '';
    }
    const errors = Object.keys(idMssg);
    if(errors.includes('required')) {
      return 'Este campo requerido';
    }
    if(errors.includes('pattern')) {
      return 'Formato incorrecto';
    }

    return '';
  }
  getMessageSec(idMssg:number, nameField:string) {
    let touched = this.myForm.get(nameField)?.touched;
    let nameFileValue = this.myForm.get(nameField)?.value;
    let pathSelect = this.validatorsService.alfaPath;
    if(idMssg !== null && idMssg!==undefined) {
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

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 5500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }
}
