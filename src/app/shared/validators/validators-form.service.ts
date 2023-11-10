import { Injectable, Pipe } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import moment from 'moment';
import { Moment } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsFormService {

  /*public noOlderDay = (control: FormControl): ValidationErrors | null =>{
    let date: Moment = control.value;
    let actualDate = new Date();
    let year = date.toObject().years;
    if (year > actualDate.getFullYear()) {
      return {
        noYear: true,
      }
    }
    return null;
  }*/

  public noOlderDay = (control: FormControl): ValidationErrors | null => {
    /*let date:string = control.value;
    console.log(date)
    return null;*/
    let value = moment(moment(control.value).toDate(),'LL').diff(moment(new Date(),'LL'),'days');//.toDate().getTime();
    if( value >= 27) {
      return {dateGrate:true}
    }
    return null
  }

  licenseValidate(no_licencia:string, idConcept:number) {
    let arrTiposLic:Map<String,number> = new Map()
    let flag:boolean = false;
    arrTiposLic.set("AUTOMOVILISTA",838).set("AUTOMOVILISTA",835).set("AUTOMOVILISTA",830);
    if (!no_licencia.charAt(0).match('^[a-zA-Z]$')) {
      return 'EL PRIMER CARACTER DEBE SER UNA LETRA.';
      return;
    }
    switch(no_licencia.charAt(0)) {
      case 'A' || 'E' || 'P':
        if ([838,835,830].find(resp => resp==idConcept) === undefined) {
          flag = true;
        }
        break;
      case 'C' || 'F':
        if (![837,834,829].find(resp => resp==idConcept) === undefined) {
          flag = true;
        }
        break;
      case 'M' || 'R':
        if (![839,836,831].find(resp => resp==idConcept) === undefined) {
          flag = true;
        }
        break;
      case 'T':
        if(idConcept!==832){
          flag = true;
        }
        break;
      default:
        flag=true;
    }
    if( flag ) {
      return 'El número de licencia no coincide con los que expide la Secretaría de Movilidad y Transporte<br>Si deseas continuar con el trámite completa el formulario';
    }
    return null;
  }




}
