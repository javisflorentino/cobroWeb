import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  public numberPattern: string = "^[0-9]+$";

  constructor() { }

  public isValidField( form: FormGroup, field: string ) {
    return form.controls[field].errors
      && form.controls[field].touched;
  }

  public isFieldOneEqualFielTwo( field1: string, field2: string) {
    return ( formGroup: AbstractControl ): ValidationErrors | null => {

      const fielValue1 = formGroup.get(field1)?.value;
      const fielValue2 = formGroup.get(field2)?.value;

      if ( fielValue1 !== fielValue2) {
        formGroup.get(field2)?.setErrors( { notEqual: true } );
        return { notEqual: true };
      }

      formGroup.get(field2)?.setErrors( null );
      return null;

    }
  }
}
