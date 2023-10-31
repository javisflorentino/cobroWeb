import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { SmyCalculoPagosService } from './smy-calculo-pagos.service';
import { ValidateVehicle } from '../interfaces/soap-valid-vehicle.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { ConvertXmlString } from '../clases/convert-xml-string';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  public numberPattern: string = "^[0-9]+$";
  public peoplesNamePath: string = '^(?![0-9]*$)[a-zA-ZÑÁÉÍÓÚ.]+([\ a-zA-ZÑÁÉÍÓÚ.]+)*$';
  public streetNamePath: string = '^(?![*_:]*$)[a-zA-ZÑÁÉÍÓÚ.#0-9\ ]+$';
  public alfaPath: string = '^[a-zA-ZÑ0-9]+$';
  public datePath: string = '^([0-9]{2,})([/])([0-9]{2,})([/])([0-9]{4,})$';//'^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/(\d{4})$';

  private asJson!:ValidateVehicle;

  private xmlSring: ConvertXmlString = new ConvertXmlString();

  constructor(private smytService: SmytService) { }

  public isValidField( form: FormGroup, field: string ) {
    return form.controls[field].errors
      && form.controls[field].touched;
  }
  /* validar fecha mayor a  */
  public validateDateGreat(currentDate: Date, date: string, mssg: number) {

    return ( formGroup: AbstractControl ): ValidationErrors | null => {
      console.log('validateDateGreat_1: ' + moment( formGroup.get(date)?.value ).toDate()+ ' / CurrentDate: ' + currentDate)
      const dateForm = moment(formGroup.get(date)?.value ).toDate();
      if(dateForm > currentDate) {
        console.log('validateDateGreat_2')
        formGroup.get(date)?.setErrors( { notEqual: true, error:mssg } );
        return { notEqual: true, error:mssg };
      }
      console.log('validateDateGreat_3')
      //formGroup.get(date)?.markAsTouched();
      formGroup.get(date)?.setErrors( null );
      return null;
    }
  }

  public isFieldOneEqualFielTwo( field1: string, field2: string, mssg: number) {
    return ( formGroup: AbstractControl ): ValidationErrors | null => {

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

  public existsSeries( serie: string, placa: string, mssg: number ) {
    return ( formGroup: AbstractControl ): ValidationErrors | null => {

      const fielValue1 = formGroup.get(serie)?.value;
      const fileValue2 = formGroup.get(placa)?.value;
      if(!formGroup.get(serie)?.pristine) {
        this.smytService.validateVehicle({ "tramite": 1, "placa": fileValue2, "numeroSerie": fielValue1, "obtenerContribuyente":false })
          .subscribe(resp => {
            if (resp?.success) {
              formGroup.get(serie)?.setErrors( null );
              return null;
            }
            formGroup.get(serie)?.setErrors( { notEqual: true, error:mssg } );
            return { notEqual: true };
          });
      }

      formGroup.get(serie)?.markAsTouched();
      formGroup.get(serie)?.setErrors( null );
      return null;
    }
  }
  validateDataInput(field: string, mssg: number, route:string) {
    return ( formGroup: AbstractControl ): ValidationErrors | null => {
      const contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente')!);

      if ( contribuyenteArr.data[route] !== undefined ) {// && contribuyenteArr.data[route]['razonSocial']=='F') {
        if (contribuyenteArr.data[route]['tipoPersona']=='M' && (field == 'primerApellido' || field == 'segundoApellido')) {
          formGroup.get(field)?.setErrors( null );
          return null;
        }

        if (contribuyenteArr.data[route]['tipoPersona']=='F' && field == 'razonSocial') {
          formGroup.get(field)?.setErrors( null );
          return null;
        }

        if (contribuyenteArr.data[route][((field=='razonSocial')?'nombre':field)] !==  String(formGroup.get(field)?.value).trim()) {
          formGroup.get(field)?.setErrors( { notEqual: true, error:mssg } );
          return { notEqual: true, error:mssg };
        }
      }
      formGroup.get(field)?.markAsTouched();
      formGroup.get(field)?.setErrors( null );
      return null;
    }
  }

}
