import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import * as moment from 'moment';

export const MY_YEAR_FORMATS = {
  parse: { dateInput: 'YYYY' },
  display: {
    dateInput: 'YYYY', // Aquí ocurre la magia solo para este componente
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-year-picker',
  template: `
    <mat-form-field appearance="outline" fxFlex="23" style="min-width: 220px; margin-right: 0.5em; margin-bottom: 0.5em;">
      <mat-label style="font-size: 12px;">{{ label }}</mat-label>
      <input matInput [formControl]="control" [matDatepicker]="picker" readonly>
      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker
        #picker
        startView="multi-year"
        (yearSelected)="chosenYearHandler($event, picker)">
      </mat-datepicker>
    </mat-form-field>
  `,
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_YEAR_FORMATS } // Aislado aquí dentro
  ],
})
export class YearPickerComponent {
  @Input() label: string = 'Selecciona Año';

  // 1. Recibimos el control del formulario directamente desde el padre
  @Input() control!: FormControl;

  chosenYearHandler(normalizedYear: moment.Moment, datepicker: MatDatepicker<moment.Moment>) {
    // 1. Extraemos solo el texto del año usando formato 'YYYY' (ej: "2035")
    const yearString = normalizedYear.format('YYYY');

    // 2. Guardamos el string de 4 dígitos directamente en el formulario del padre
    this.control.setValue(yearString);

    // 3. Cerramos el selector
    datepicker.close();
  }
}
