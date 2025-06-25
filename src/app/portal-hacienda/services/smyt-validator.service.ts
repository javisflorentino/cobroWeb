import { inject, Injectable } from '@angular/core';
import { SmytService } from './smyt.service';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import moment from 'moment';
import { Observable, of } from 'rxjs';
import { Messages } from '../interface/portal-message.interface';

import ListMessage from '../../../../data/smyt_alertas.json';

@Injectable({
  providedIn: 'root'
})
export class SmytValidatorService {

  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$";
  public numberPattern: string = "^[0-9]+$";
  public exprCp = '^[0-9]{5}$';//Expresión para validar el código postal
  public expNoTel = '^[\(]([1-9]{2,3})[\)][\ ][0-9]{7,8}$'; // Expresión para validar No Telefónico
  //[\(]?[\+]?(\d{2}|\d{3})[\)]?[\s]?((\d{6}|\d{8})|(\d{3}[\*\.\-\s]){2}\d{3}|(\d{2}[\*\.\-\s]){3}\d{2}|(\d{4}[\*\.\-\s]){1}\d{4})|\d{8}|\d{10}|\d{12}$
  public peoplesNamePath: string = '^(?![0-9]*$)[a-zA-ZÑÁÉÍÓÚ.]+([\ a-zA-ZÑÁÉÍÓÚ.]+)*$';
  public streetNamePath: string = '^(?![*_:]*$)[a-zA-ZÑÁÉÍÓÚ.#0-9\ ]+$';
  public alfaPath: string = '^[a-zA-ZÑ0-9]+$';
  public datePath: string = '^([0-9]{2,})([/])([0-9]{2,})([/])([0-9]{4,})$';//'^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/(\d{4})$';
  public rfcPath = '^[a-zA-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[a-zA-Z0-9]{2}[0-9A]$';

  private smytService = inject(SmytService);

  constructor() { }

  /* validar fecha mayor a  */
  public cantBeGreat = ( control: FormControl ): ValidationErrors | null => {

    let value = moment(control.value).toDate();
    let toDate = new Date()
    if( value > toDate) {
      return {dateGrate:true}
    }
    return null
  }


  public existsPlaca(placa: string, mssg: number, tramite: number, tipoVehiculo: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      let tipo: string = tipoVehiculo;
      let dateForm;
      if (tipoVehiculo === 'tipo_vehiculo')
        tipo = formGroup.get(tipoVehiculo)?.value;

      const fileValue2 = formGroup.get(placa)?.value;

      let parameters = { "tramite": tramite, "placa": fileValue2, "tipoVehiculo": Number.parseInt(tipo), fechaFactura: dateForm, "obtenerContribuyente": false };
      if (!formGroup.get(placa)?.pristine) {
        this.smytService.validateVehicle(parameters)
          .subscribe({
            next: (resp) => {
              if (resp?.success) {
                formGroup.get(placa)?.setErrors(null);
                return null;
              }
              formGroup.get(placa)?.setErrors({ notEqual: true, error: mssg });
              return { notEqual: true };
            }
          }

            /*resp => {
            console.log(resp);
            if (resp?.success) {
              formGroup.get(serie)?.setErrors( null );
              return null;
            }
            formGroup.get(serie)?.setErrors( { notEqual: true, error:mssg } );
            return { notEqual: true };
          }*/);
      }

      formGroup.get(placa)?.markAsTouched();
      formGroup.get(placa)?.setErrors(null);
      return null;
    }
  }

  public existsSerie(placa: string, serie: string, mssg: number, tramite: number, tipoVehiculo: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      let tipo: string = tipoVehiculo;
      let dateForm;
      if (tipoVehiculo === 'tipo_vehiculo')
        tipo = formGroup.get(tipoVehiculo)?.value;

      const fileValue2 = formGroup.get(placa)?.value;
      const fileValue1 = formGroup.get(serie)?.value;

      dateForm = new Date().getDate() + '/' + (new Date().getMonth()+1) + '/' + new Date().getFullYear();
      if(formGroup.get(placa)?.status !== 'DISABLED' && formGroup.get(placa)?.status !== undefined ) {
        tramite = 1;
        mssg = 4;
      }
        //return null;

      let parameters = { "modelo":2019, "tramite": tramite, "placa": fileValue2, "numeroSerie": fileValue1, "tipoVehiculo": Number.parseInt(tipo), fechaFactura: dateForm, "obtenerContribuyente": false };
      if (!formGroup.get(serie)?.pristine) {
        this.smytService.validateVehicle(parameters)
          .subscribe({
            next: (resp) => {
              if (resp?.success) {
                formGroup.get(serie)?.setErrors(null);
                return null;
              }
              formGroup.get(serie)?.setErrors({ notEqual: true, error: mssg });
              return { notEqual: true };
            }
          }
        );
      }

      formGroup.get(serie)?.markAsTouched();
      formGroup.get(serie)?.setErrors(null);
      return null;
    }
  }
  public isValidField( form: FormGroup, field: string ) {
    return form.controls[field].errors
      && form.controls[field].touched;
  }

  getMessages_vehicle(): Observable<Messages[]> {
    return of(ListMessage.messages_vehicle);
    /* MODIF: 12/12/2023 */
    //this.http.get<Messages[]>(`${this.urlMessage}_vehicle`);
  }

  isFieldOneEqualFielTwo( field1: string, field2: string, mssg: number) {
    return ( formGroup: AbstractControl ): ValidationErrors | null => {

      if(formGroup.get(field1)?.status == 'DISABLED' || formGroup.get(field2)?.status == 'DISABLED')
        return null;
      const fielValue1 = formGroup.get(field1)?.value;
      const fielValue2 = formGroup.get(field2)?.value;

      if ( fielValue1 !== fielValue2) {
        formGroup.get(field2)?.setErrors( { notEqual: true, error:mssg } );
        return { notEqual: true, error:mssg };
      }
      formGroup.get(field2)?.markAsTouched();
      formGroup.get(field2)?.setErrors( null );
      return null;

    }
  }
}
