import { Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

import { GeneralesService } from '../../../services/generales.service';
import { ComboConcept, ComboDTO } from 'src/app/portal-hacienda/interface/datos-combo.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';

import ListaAsentamientos from '../../../../../../data/arreglos/asentamientos.json'
import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';
import ListMessage from '../../../../../../data/arreglos/hacienda_mensajes.json'
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FechaVencimientoISAN } from 'src/app/shared/interfaces/soap-fechavencimiento-isan';
import { ConvertXmlString } from 'src/app/shared/clases/convert-xml-string';
import Swal from 'sweetalert2';

const moment = _rollupMoment || _moment;
const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-isan-pages',
  templateUrl: './isan-pages.component.html',
  styles: [
  ],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class IsanPagesComponent implements OnInit, OnDestroy{

  @ViewChild('callDialog')
  private callDialog?: TemplateRef<any>;

  @ViewChild('accordion')
  public Accordion!: MatAccordion;

  //Variable de tipo Estados y se le agrega el arreglo
  public estadosArr:    ComboConcept[] = [];
  public municipiosArr: ComboConcept[] = [];
  public localidadArr:  ComboConcept[] = [];
  public asentamientoList = ListaAsentamientos;

  public mssgArr: MessageSmyt[] = ListMessage.hacienda_isan;

  public step: number = 0;

  /** Se usa para finalizar la subscripcion al salir del módulo */
  private ActivatedRouteSubscribe?: Subscription;

  //Se obtiene una referencia a todo el componente que se renderizó en este componente. Se uso el nombre del componente
  private idConcepto: number = 0;
  private tipoForm: number = 0;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  public conceptTitle: string = '';

  private asJson!:FechaVencimientoISAN;
  private xmlSring: ConvertXmlString = new ConvertXmlString();

  private fb = inject( FormBuilder )
  public myForm: FormGroup = this.fb.group({
    monto: [ 1,[Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberPattern)] ],
    fecha_pago: [moment(),[Validators.required]],
    rfc: ['', [Validators.pattern(this.validatorService.rfcPath)]]
  });

  public myFormTaxt: FormGroup = this.fb.group({
    rfc_taxt:          ['',[Validators.required, Validators.pattern(this.validatorService.rfcPath)]],
    pass_taxt:         ['',[Validators.required]],
    email_taxt:        ['',[Validators.required, Validators.pattern(this.validatorService.emailPattern)]],
    nacion_taxt:       ['M',[Validators.required]],
    razon_social_taxt: ['',[Validators.required, Validators.pattern(this.validatorService.peoplesNamePath)]],
    abreviatura_taxt:  ['',[Validators.required]],
    domicilio_taxt: this.fb.group({
      estado_taxt:              ['',[Validators.required]],
      municipio_taxt:           ['',[Validators.required]],
      localidad_taxt:           ['',[Validators.required]],
      cp_taxt:                  ['',[Validators.required, Validators.pattern(this.validatorService.exprCp)]],
      tipo_asentamineto_taxt:   ['',[Validators.required]],
      nombre_asentamiento_taxt: ['',[Validators.required]],
      tipo_vialidad_taxt:       ['',[Validators.required]],
      nombre_vialidad_taxt:          ['',[Validators.required]],
      no_ext_taxt:              ['',[Validators.required]],
      no_int_taxt:              ['',[Validators.required]],
      telefono_taxt:            ['',[Validators.required, Validators.pattern(this.validatorService.expNoTel)]]
    })
  });

  @HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  constructor( private validatorService: ValidatorsService,
               public dialog:MatDialog,
               private generalesService: GeneralesService,
               private _snackBar: MatSnackBar,
               private activateRaute: ActivatedRoute,
               private router: Router ) {}

  ngOnInit(): void {
    this.conceptTitle = sessionStorage.getItem('concept')!;

    this.ActivatedRouteSubscribe = this.activateRaute.params.subscribe(({idConcepto,tipoForm}) => {
      this.idConcepto = idConcepto;
      this.tipoForm = tipoForm;
    });

    this.generalesService.getEntidadesFederativas()
      .subscribe(resp => {
        if(!resp){
          this.openSnackBar('Problema con el API-SERVER, favor de contactar a Servicio Técnico ');
        } else {
          this.estadosArr = resp.data;
        }

      });

  }

  ngOnDestroy(): void {
    this.ActivatedRouteSubscribe?.unsubscribe();
  }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.myForm.get('fecha_pago')?.value!;
    //console.log(ctrlValue)
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.myForm.get('fecha_pago')!.setValue(ctrlValue);
    datepicker.close();
  }

  addNewTaxtPay(){
    let dialogRef = this.dialog.open(this.callDialog!);
    dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
            if (result !== 'no') {
              const enabled = "Y"
            } else if (result === 'no') {
               console.log('User clicked no.');
            }
        }
    })
  }

  setStep(index: number): void {
    this.step = index;
  }

  changeEstado(event: string): void {
    this.generalesService.getMunicipios(Number(event))
      .subscribe(resp => {
        if(!resp){
          this.openSnackBar('Problema con el API-SERVER, favor de contactar a Servicio Técnico ');
        } else {
          this.municipiosArr = resp.data;
        }

      });
  }

  changeMunicipio(event: string): void {
    this.generalesService.getLocalida(event)
      .subscribe(resp => {
        if(!resp){
          this.openSnackBar('Problema con el API-SERVER, favor de contactar a Servicio Técnico ');
        } else {
          this.localidadArr = resp.data;
        }

      });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 5500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
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

  onSubmit() {
    let month = moment(this.myForm.get('fecha_pago')?.value).month();
    let year = moment(this.myForm.get('fecha_pago')?.value).year();
    this.isLoading = true;
    this.buttBlock = true;
    if ( this.myForm.invalid ) {
      this.myForm.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }
    if((year <= new Date().getFullYear())) {
      let control: boolean = true;
      if((year == new Date().getFullYear()) && ((month+1) > (new Date().getMonth()+1))) {
        control=false;
      }
      if(control) {
        sessionStorage.setItem('datos_cobro',JSON.stringify(
          {
            cantidad:         1,
            monto:            Number(this.myForm.get('monto')?.value),
            periodo:          month+1,
            ejercicio:        year,
            sistema:          40,
            tipo_form:         this.tipoForm
          })
        );
        sessionStorage.setItem('route_origen',`hacienda/hacienda-isan/${this.idConcepto}/${this.tipoForm}`);
        this.router.navigate(['/pagos/tabla-conceptos',this.idConcepto,this.tipoForm]);
      } else {
        this.emitRestrictionMessage();
      }
    } else {
      this.emitRestrictionMessage();
    }

  }

  emitRestrictionMessage(): void {
    Swal.fire({title: "Error !!",text: 'No puede pagar un periodo o ejercicio fiscal que no ha pasado.',icon: "error",allowOutsideClick:false})
            .then(() => {
              this.isLoading = false;
            });
  }

  onSubmitNewTaxtPay(): void {
    this.isLoading = true;
    this.buttBlock = true;
    if ( this.myFormTaxt.invalid ) {
      this.myFormTaxt.markAllAsTouched();
      this.Accordion.openAll();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }
  }
}
