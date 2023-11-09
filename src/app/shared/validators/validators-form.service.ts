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




}
