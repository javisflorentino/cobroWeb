import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { SmyCalculoPagosService } from './smy-calculo-pagos.service';
import { ValidarVehiculo, ValidateVehicle } from '../interfaces/soap-valid-vehicle.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  public numberPattern: string = "^[0-9]+$";

  private asJson!:ValidateVehicle;

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

      this.smytService.validateVehicle(fileValue2!,fielValue1!)
      .then(response => response.text())
      .then(xml => {
        console.log(xml)
        this.asJson = this.xmlStringToJson(xml.toString());
        if(this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'] === 'EXITO') {
          formGroup.get(serie)?.setErrors( null );
          return null;
        }
        formGroup.get(serie)?.setErrors( { notEqual: true } );
        return { notEqual: true };
      }).catch (err => console.log(err));
      return null;
    }
  }



  xmlStringToJson(xml: string)
  {
      const oParser = new DOMParser();
      const xmlDoc = oParser.parseFromString(xml, "application/xml");
      return this.xmlToJson(xmlDoc);
  }

  /**
   * REF: https://davidwalsh.name/convert-xml-json
   */
  xmlToJson(xml:any)
  {
    // Create the return object
    var obj:any = {}

    if (xml.nodeType == 1) { // element
      // do attributes
      if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
          var attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType == 3) { // text
      obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
      for(var i = 0; i < xml.childNodes.length; i++) {
        var item = xml.childNodes.item(i);
        var nodeName = item.nodeName;
        if (typeof(obj[nodeName]) == "undefined") {
          obj[nodeName] = this.xmlToJson(item);
        } else {
          if (typeof(obj[nodeName].push) == "undefined") {
            var old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(this.xmlToJson(item));
        }
      }
    }
    return obj;
  }
}
