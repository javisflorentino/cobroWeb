import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

import ListaEstados from '../../../../../../data/arreglos/estados.json'
import { GeneralesService } from '../../../services/generales.service';
import { ComboConcept, ComboDTO } from 'src/app/portal-hacienda/interface/datos-combo.interface';
import { Data } from '../../../interface/portal-calculo-concepto.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';

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

  //Variable de tipo Estados y se le agrega el arreglo
  public estadosArr: ComboConcept[] = [];
  public municipiosArr: ComboConcept[] = [];

  public step: number = 0;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  public conceptTitle: string = '';

  private fb = inject( FormBuilder )
  public myForm: FormGroup = this.fb.group({
    monto: [ 1,[Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberPattern)] ],
    fecha_pago: [moment()],
    rfc: ['', [Validators.pattern(this.validatorService.rfcPath)]]
  });

  public myFormTaxt: FormGroup = this.fb.group({
    rfc_taxt:          [],
    pass_taxt:         [],
    email_taxt:        [],
    nacion_taxt:       [],
    razon_social_taxt: [],
    abreviatura_taxt:  [],
    domicilio_taxt: this.fb.group({
      estado_taxt:              ['',[Validators.required]],
      municipio_taxt:           ['',[Validators.required]],
      localidad_taxt:           [],
      cp_taxt:                  [],
      tipo_asentamineto_taxt:   [],
      nombre_asentamineto_taxt: [],
      tipo_vialidad_taxt:       [],
      nombre_vialidad:          [],
      no_ext_taxt:              [],
      no_int_taxt:              [],
      telefono_taxt:            []
    })
  })

  constructor( private validatorService: ValidatorsService,
               public dialog:MatDialog,
               private generalesService: GeneralesService,
               private _snackBar: MatSnackBar ) {}

  ngOnInit(): void {
    this.conceptTitle = localStorage.getItem('concept')!;

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
                console.log(result);
            } else if (result === 'no') {
               console.log('User clicked no.');
            }
        }
    })
  }

  setStep(index: number): void {
    this.step = index;
  }

  changeEstado(event: string) {
    console.log(event);
    this.generalesService.getMunicipios(event)
      .subscribe(resp => {
        if(!resp){
          this.openSnackBar('Problema con el API-SERVER, favor de contactar a Servicio Técnico ');
        } else {
          this.municipiosArr = resp.data;
        }

      });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 5500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
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
  }
}
