import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { SmyCalculoPagosService } from './smy-calculo-pagos.service';
import { ValidateVehicle } from '../interfaces/soap-valid-vehicle.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { ConvertXmlString } from '../clases/convert-xml-string';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  public numberPattern: string = "^[0-9]+$";
  public peoplesNamePath: string = '^(?![0-9]*$)[a-zA-ZÑÁÉÍÓÚ.]+([\ a-zA-ZÑÁÉÍÓÚ.]+)*$';
  public streetNamePath: string = '^(?![*_:]*$)[a-zA-ZÑÁÉÍÓÚ.#0-9\ ]+$';

  private asJson!:ValidateVehicle;

  private xmlSring: ConvertXmlString = new ConvertXmlString();

  constructor(private smytService: SmytService) { }

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

  public existsSeries( serie: string, placa: string ) {
    console.log('existsSeries');
    return ( formGroup: AbstractControl ): ValidationErrors | null => {

      const fielValue1 = formGroup.get(serie)?.value;
      const fileValue2 = formGroup.get(placa)?.value;
      if(!formGroup.get(serie)?.pristine) {
        /*this.smytService.validateVehicle(fileValue2!,fielValue1!)
        .then(response => response.text())
        .then(xml => {
          console.log(xml)
          this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
          if(this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'] === 'EXITO') {
            formGroup.get(serie)?.setErrors( null );
            return null;
          }
          formGroup.get(serie)?.setErrors( { notEqual: true } );
          return { notEqual: true };
        }).catch (err => console.log(err));
        return null;*/
        this.smytService.validateVehicle({ "tramite": 1, "placa": fileValue2, "numeroSerie": fielValue1, "obtenerContribuyente":false })
          .subscribe(resp => {
            if (resp?.success) {
              formGroup.get(serie)?.setErrors( null );
              return null;
            }
            formGroup.get(serie)?.setErrors( { notEqual: true } );
            return { notEqual: true };
          });
      }

      formGroup.get(serie)?.setErrors( null );
      return null;
    }
  }
  validateDataInput(field: string, mssg: number, route:string) {
    return ( formGroup: AbstractControl ): ValidationErrors | null => {
      console.log('Log_1')
      const contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente')!);
      console.log(contribuyenteArr.data[route])
      if ( contribuyenteArr.data[route] !== undefined ) {// && contribuyenteArr.data[route]['razonSocial']=='F') {
        console.log('Log_2')
        if (contribuyenteArr.data[route]['tipoPersona']=='M' && (field == 'primerApellido' || field == 'segundoApellido')) {
          console.log('Log_3')
          formGroup.get(field)?.setErrors( null );
          return null;
        }

        if (contribuyenteArr.data[route]['tipoPersona']=='F' && field == 'razonSocial') {
          console.log('Log_4')
          formGroup.get(field)?.setErrors( null );
          return null;
        }

        if (contribuyenteArr.data[route][((field=='razonSocial')?'nombre':field)] !==  String(formGroup.get(field)?.value).trim()) {
          console.log('Log_5')
          formGroup.get(field)?.setErrors( { notEqual: true, error:mssg } );
          return { notEqual: true, error:mssg };
        }
      }
      formGroup.get(field)?.setErrors( null );
      return null;
    }
  }

}
