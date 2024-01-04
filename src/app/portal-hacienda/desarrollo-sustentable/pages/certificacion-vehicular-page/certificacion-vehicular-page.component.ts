import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';

import ListMessageDesarrollo from '../../../../../../data/arreglos/desarrolloS_messages.json';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

const moment = _rollupMoment || _moment;
const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMM YYYY',
  },
};

@Component({
  selector: 'desarrollos-certificacion-vehicular-page',
  templateUrl: './certificacion-vehicular-page.component.html',
  styles: [],
  providers: [ {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS} ]
})
export class CertificacionVehicularPageComponent implements OnInit, OnDestroy {

  /* Inyeccion de la depoendencia encargada de formularios */
  private fb = inject( FormBuilder );
  public myForm: FormGroup = this.fb.group({
    folio:         ['', [Validators.required]],
    anio:          [moment(), [Validators.required]],
    semestre:      ['1', [Validators.required]],
    certificacion: ['', [Validators.required]]
  });

  /* Inyeccion del servicio donde se aplican las validaciones de campos del FORM */
  private validatorsService = inject( ValidatorsService );

  /* ACCEDER A LAS REDIRECCIONES */
  private router = inject( Router );

  /* MANEJO DE INFORMACION RECIBIDA POR LA URL */
  private activateRaute = inject( ActivatedRoute );
  private ActivatedRouteSubscribe!: Subscription;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  /* Se usa para obtener el nombre del concepto seleccionado y mostrarlo en el HTML */
  public nameConcept: string = '';

  public mssgArr: MessageSmyt[] = ListMessageDesarrollo.calidad_aire_certificacionver;

  /* CONTROLA EL AÑO MAX Y MIN A SELECCIONAR */
  public _max: Date = new Date(new Date().getFullYear()+1,11,31);
  public _min: Date = new Date(new Date().getFullYear()-2,0,1);

  //Se obtiene una referencia a todo el componente que se renderizó en este componente. Se uso el nombre del componente
  private idConcepto: number = 0;
  private tipoForm: number = 0;

  /* CONTROLA EL NOMBRE DEL CONCEPTO Y MOSTRARLO EN HTML */
  public conceptTitle: string = '';

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
    localStorage.setItem('route_origen',`desarrollo-sustentable/calidad-aire-certificacionver/${this.idConcepto}/${this.tipoForm}`);
    localStorage.setItem('datos_cobro',JSON.stringify(
      {
        cantidad:           1,
        monto:              1,
        idConcepto:         this.idConcepto,
        folio:              this.myForm.get('folio')?.value,
        anio:               this.myForm.get('anio')?.value,
        semestre:           this.myForm.get('semestre')?.value,
        certificacion:      this.myForm.get('certificacion')?.value,
        tipo_form:          this.tipoForm
      })
    )

    this.router.navigate(['/pagos/tabla-conceptos',this.idConcepto,this.tipoForm]);
    return;
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

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.myForm.get('anio')?.value!;
    //ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.myForm.get('anio')!.setValue(ctrlValue);
    datepicker.close();

  }



}
