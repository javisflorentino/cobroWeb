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
    let flag:boolean = false;
    if (!no_licencia.charAt(0).match('^[a-zA-Z]$')) {
      return 'EL PRIMER CARACTER DEBE SER UNA LETRA.';
    }
    switch(no_licencia.charAt(0)) {
      case 'A':
      case 'E':
      case 'P':
        if ([838,835,830].find(resp => resp==idConcept) === undefined) {
          flag = true;
        }
        break;
      case 'C':
      case 'F':
        if ([837,834,829,5306].find(resp => resp==idConcept) === undefined) {
          flag = true;
        }
        break;
      case 'M':
      case 'R':
        if ([839,836,831].find(resp => resp==idConcept) === undefined) {
          flag = true;
        }
        break;
      case 'T':
        if([832].find(resp => resp==idConcept) === undefined){
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
