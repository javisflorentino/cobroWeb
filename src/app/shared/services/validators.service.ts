import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { ValidateVehicle } from '../interfaces/soap-valid-vehicle.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { ConvertXmlString } from '../clases/convert-xml-string';
import moment from 'moment';

import ListMessageSmyt from '../../../../data/arreglos/smyt_mensajes.json'
import { MessageSmyt } from '../interfaces/message-smyt.interface';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$";
  public numberPattern: string = "^[0-9]+$";
  public exprCp = '^[0-9]{5}$';//Expresión para validar el código postal
  public expNoTel = '^[\(]([1-9]{2,3})[\)][\ ][0-9]{7,8}$'; // Expresión para validar No Telefónico
  public expNoTelNew = '^(?!0+$)[\(]?[0-9]{2,3}[\)]?[\ -]?[0-9]{7,8}$'; // Expresión para validar No Telefónico
  //[\(]?[\+]?(\d{2}|\d{3})[\)]?[\s]?((\d{6}|\d{8})|(\d{3}[\*\.\-\s]){2}\d{3}|(\d{2}[\*\.\-\s]){3}\d{2}|(\d{4}[\*\.\-\s]){1}\d{4})|\d{8}|\d{10}|\d{12}$
  public peoplesNamePath: string = '^(?![0-9]*$)[a-zA-ZÑÁÉÍÓÚ.]+([\ a-zA-ZÑÁÉÍÓÚ.]+)*$';
  public peoplesNamePathWithNumbers: string = '^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9.,&\\-\\s]{2,150}$';//'^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9.,&\- ]{2,150}$';//'^(?=.*[a-zA-ZÑÁÉÍÓÚ])[a-zA-ZÑÁÉÍÓÚ0-9.]+([\ a-zA-ZÑÁÉÍÓÚ0-9.]+)*$';

  public streetNamePath: string = '^(?![*_:]*$)[a-zA-ZÑÁÉÍÓÚ.#0-9\ ]+$';
  public alfaPath: string = '^[a-zA-ZÑ0-9]+$';
  public datePath: string = '^([0-9]{2,})([/])([0-9]{2,})([/])([0-9]{4,})$';//'^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/(\d{4})$';
  public rfcPath = /^[a-zA-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[a-zA-Z0-9]{2}[0-9A]$/i;
  public rfcFisica = /^([a-z&ñ]{4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01]))([a-z0-9]{2}[0-9a])?$/i;
  public rfcMoral = /^([a-z&ñ]{3}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01]))([a-z0-9]{2}[0-9a])$/i;

  public mssgArr: MessageSmyt[] = ListMessageSmyt.smyt_refrendo;

  private asJson!:ValidateVehicle;

  private xmlSring: ConvertXmlString = new ConvertXmlString();

  constructor(private smytService: SmytService) { }

  public isValidField( form: FormGroup, field: string ) {
    return form.controls[field].errors
      && form.controls[field].touched;
  }
  /* validar fecha mayor a  */
  public cantBeGreat = ( control: FormControl ): ValidationErrors | null => {

    let value = moment(control.value).toDate();
    let toDate = new Date()
    if( value > toDate) {
      return {dateGrate:true}
    }
    return null
  }

  /* VALIDAR FECHA DE RETENCIÓN */
  public validateRetencion = ( control: FormControl): ValidationErrors | null =>{
    let retencionDate = moment(control.value).toDate();
    let toDate = new Date()
    const f1 = new Date(new Date().getFullYear(), 0, 20);

    if(toDate > f1){
      if(retencionDate.getFullYear() < toDate.getFullYear() || retencionDate.getFullYear() > toDate.getFullYear()){
        return { fechaFueraRango: true}
      }
    } else {
      if(retencionDate.getFullYear() > toDate.getFullYear()){
        return { fechaFueraRango: true}
      }
    }
    return null;
  }

  public validateDateGreat(currentDate: Date, date: string, mssg: number) {

    return ( formGroup: AbstractControl ): ValidationErrors | null => {
      const dateForm = moment(formGroup.get(date)?.value ).toDate();
      if(dateForm > currentDate) {
        formGroup.get(date)?.setErrors( { notEqual: true, error:mssg } );
        return { notEqual: true, error:mssg };
      }
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

  public existsSeriesPublico( serie: string, placa: string, mssg: number, tramite: number, tipoVehiculo: string, fechaFactura:string ) {
    return ( formGroup: AbstractControl ): ValidationErrors | null => {
      const fielValue1 = formGroup.get(serie)?.value;
      const fileValue2 = formGroup.get(placa)?.value;

      let parameters = { "tramite": tramite, "placa": fileValue2, "numeroSerie": fielValue1, "obtenerContribuyente":false };
      if(!formGroup.get(serie)?.pristine) {
        this.smytService.validateVehiclePublico(parameters)
          .subscribe({
            next:(resp)=>{
              if (resp?.success) {
                formGroup.get(serie)?.setErrors( null );
                return null;
              }
              const codeArr = this.mssgArr.filter(r =>  r.msg == String(resp?.data) )
              formGroup.get(serie)?.setErrors( { notEqual: true, error:(codeArr.length>0)?((codeArr[0].id==10)?'11':codeArr[0].id):mssg } );
              return { notEqual: true };
            },
            error:(err)=>{
              if(!!err.code) {
                formGroup.get(serie)?.setErrors( { notEqual: true, error:err.code } );
              } else {
                formGroup.get(serie)?.setErrors( { notEqual: true, error:mssg } );
              }
              return { notEqual: true };
            }
          });
      }

      formGroup.get(serie)?.markAsTouched();
      formGroup.get(serie)?.setErrors( null );
      return null;
    }
  }

  public existsSeries( serie: string, placa: string, mssg: number, tramite: number, tipoVehiculo: string, fechaFactura:string ) {
    return ( formGroup: AbstractControl ): ValidationErrors | null => {
      let tipo: string = tipoVehiculo;
      let dateForm;
      if (tipoVehiculo === 'tipo_vehiculo')
        tipo = formGroup.get(tipoVehiculo)?.value;
      if(fechaFactura !== null) {
        dateForm = moment(formGroup.get(fechaFactura)?.value ).toDate();
        dateForm = dateForm.getDate() + '/' + (dateForm.getMonth()+1) + '/' + dateForm.getFullYear();
      }
      const fielValue1 = formGroup.get(serie)?.value;
      const fileValue2 = formGroup.get(placa)?.value;

      let parameters = { "modelo":2019, "tramite": tramite, "placa": fileValue2, "numeroSerie": fielValue1, "tipoVehiculo":Number.parseInt(tipo), fechaFactura:dateForm, "obtenerContribuyente":false };
      if(!formGroup.get(serie)?.pristine) {
        this.smytService.validateVehicle(parameters)
          .subscribe({
            next:(resp)=>{
              if (resp?.success) {
                formGroup.get(serie)?.setErrors( null );
                return null;
              }
              const codeArr = this.mssgArr.filter(r =>  r.msg == String(resp?.data) )
              formGroup.get(serie)?.setErrors( { notEqual: true, error:(codeArr.length>0)?((codeArr[0].id==10)?'11':codeArr[0].id):mssg } );
              return { notEqual: true };
            },
            error:(err)=>{
              if(!!err.code) {
                formGroup.get(serie)?.setErrors( { notEqual: true, error:err.code } );
              } else {
                formGroup.get(serie)?.setErrors( { notEqual: true, error:mssg } );
              }
              return { notEqual: true };
            }
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
        /*
          Toma una cadena, la pasa a mayusculas, reemplaza los espacios en blanco, se normaliza y se eliman los diacriticos (acentos, tildes, etc)
          String(formGroup.get(field)?.value).toUpperCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g,"").normalize()
        */
        if (String(contribuyenteArr.data[route][((field=='razonSocial')?'nombre':field)]).toUpperCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g,"").normalize() !==  String(formGroup.get(field)?.value).toUpperCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g,"").normalize()) {
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
