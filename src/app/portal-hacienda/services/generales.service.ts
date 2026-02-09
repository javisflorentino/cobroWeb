import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environments } from 'src/environments/environments';
import { Observable, catchError, filter, map, of, tap } from 'rxjs';
import { ComboConcept, ComboDTO, DefinArrEstMun } from '../interface/datos-combo.interface';
import { CalculoConcepto } from '../interface/portal-calculo-concepto.interface';
import { AbstractControl, ValidationErrors } from '@angular/forms';

import ListMessage from '../../../../data//arreglos/alertas.json';

import { ValidateVehicle } from 'src/app/shared/interfaces/soap-valid-vehicle.interface';
import { ConvertXmlString } from 'src/app/shared/clases/convert-xml-string';
import { Messages } from '../interface/portal-message.interface';
import { ResponseStruct } from 'src/app/shared/interfaces/response-struct.interface';

@Injectable({
  providedIn: 'root'
})
export class GeneralesService {

  private baseUrlApp = `${environments.baseUrlApp}${environments.appEnviroment}`;
  private urlSOAP = `${environments.baseUrlServ}`;

  private baseUrlSiigem = `${environments.baseUrlSiigem}${environments.siigemEnviroment}`;

  private asJson!: ValidateVehicle;
  private xmlSring: ConvertXmlString = new ConvertXmlString();

  constructor(private http: HttpClient) { }

  getEntidadesFederativas(idEntidad?: number): Observable<ComboDTO | null> {
    let headers = new HttpHeaders();
    const body = (idEntidad) ? JSON.stringify({ "pkEntidadFederativa": idEntidad }) : JSON.stringify({});
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<ComboDTO>(`${this.baseUrlApp}/combo/obtenerEstados`, body, { headers })
      .pipe(
        catchError(error => of(null))
      );
  }
  getMunicipios(idEntidad: number, idMunicipio?: number): Observable<ComboDTO | null> {
    let headers = new HttpHeaders();
    let body: DefinArrEstMun = {} as DefinArrEstMun;//JSON.stringify({"pkEntidadFederativa": idEntidad});//new FormData();
    body.pkEntidadFederativa = idEntidad;
    if (idMunicipio) {
      body.pkMunicipio = idMunicipio;
    }
    //body.append("pkEntidadFederativa", idEntidad);
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));
    //headers = headers.set("mimeType", "multipart/form-data")


    return this.http.post<ComboDTO>(`${this.baseUrlApp}/combo/obtenerListaMunicipios`, body, { headers })
      .pipe(
        catchError(error => of(null))
      );
  }

  getLocalida(idMunicipio: string): Observable<ComboDTO | null> {
    let headers = new HttpHeaders();
    const body = new FormData();
    body.append("pk", idMunicipio);
    headers = headers.set("mimeType", "multipart/form-data")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));
    return this.http.post<ComboDTO>(`${this.baseUrlApp}/combo/obtenerLocalidades`, body, { headers })
      .pipe(
        tap(resp => console.log(resp)),
        catchError(error => of(null))
      );
  }

  getConceptoDetalleRest(idConcepto: number, cantidad: number, monto: number): Observable<CalculoConcepto | null> {
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<CalculoConcepto>(`${this.baseUrlApp}/concepto/obtenerConcepto`, JSON.stringify({ "idConcepto": idConcepto, "monto": monto, "cantidad": cantidad }), { headers })
      .pipe(
        catchError(error => of(null))
      );

  }

  getConceptoDetallebyForm(idConcepto: number, cantidad: number, idFomr: string, formaType: string): Observable<CalculoConcepto | null> {
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<CalculoConcepto>(`${this.baseUrlApp}/concepto/validarFormulario`, JSON.stringify([{ "id": idFomr, "idConcepto": idConcepto, "data": [{ "id": formaType, "value": cantidad }] }]), { headers })
      .pipe(
        tap(resp => console.log(resp)),
        catchError(error => of(null))
      );

  }

  async getFechaVencimientoISAN(periodo: number, ejercicio: number): Promise<any> {
    return await fetch(`${this.urlSOAP}conceptos/services/isan`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imp="http://impuestos/"><soapenv:Header/><soapenv:Body><imp:obtenFechaVencimiento><!--Optional:--><periodo>${periodo}</periodo><!--Optional:--><ejercicio>${ejercicio}</ejercicio></imp:obtenFechaVencimiento></soapenv:Body></soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8" },
      redirect: "follow"
    })

  }

  getDetalleCobroISAN(importe: number, fecha: string, periodo: number, idConcepto: number): Observable<CalculoConcepto | null> {
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));
    console.log([{ "id": "sh-form-16", "idConcepto": idConcepto, "data": [{ "id": "sh-input-monto", "value": importe }, { "id": "sh-input-periodo", "value": periodo }, { "id": "sh-input-ejercicioFiscal", "value": fecha }] }])
    return this.http.post<CalculoConcepto>(`${this.baseUrlApp}/concepto/validarFormulario`, JSON.stringify([{ "id": "sh-form-16", "idConcepto": idConcepto, "data": [{ "id": "sh-input-monto", "value": importe }, { "id": "sh-input-periodo", "value": periodo }, { "id": "sh-input-ejercicioFiscal", "value": fecha }] }]), { headers })
      .pipe(
        map(resp => {
          if (resp.success) {
            return resp;
          }
          throw { message: resp.mensaje, error: "Unauthorized", statusCode: 401 };
        }),
        catchError(error => { throw error; })
      );
  }

  getDetalleCobroImpuestoCedular(fecha: string, importe: number, idConcepto: number): Observable<CalculoConcepto | null> {
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));
    //console.log([{"id": "sh-form-16","idConcepto": idConcepto,"data": [{"id": "sh-input-monto","value": importe},{"id": "sh-input-periodo","value": periodo},{"id": "sh-input-ejercicioFiscal","value": fecha}]}])
    return this.http.post<CalculoConcepto>(`${this.baseUrlApp}/concepto/validarFormulario`, JSON.stringify([{ "id": "sh-form-19", "idConcepto": idConcepto, "data": [{ "id": "sh-input-fecha", "value": fecha }, { "id": "sh-input-monto", "value": importe }] }]), { headers })
      .pipe(
        map(resp => {
          if (resp.success) {
            return resp;
          }
          throw { message: resp.mensaje, error: "Unauthorized", statusCode: 401 };
        }),
        catchError(error => { throw error; })
      );
  }

  async getRezagosActualizaciones(idConcepto: number, monto: number, fecha: string): Promise<any> {
    return await fetch(`${this.urlSOAP}conceptos/services/isan`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imp="http://impuestos/">
        <soapenv:Header/>
        <soapenv:Body>
          <imp:obtenerRezagosActualizacionAdicionales>
            <!--Optional:-->
            <idConcepto>${idConcepto}</idConcepto>
            <!--Optional:-->
            <importe>${monto}</importe>
            <!--Optional:-->
            <fecha>${fecha}</fecha>
          </imp:obtenerRezagosActualizacionAdicionales>
        </soapenv:Body>
      </soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8" },
      redirect: "follow"
    });
  }

  /*async getDetalleCobroISAN(importe:number, fecha:string, idConcepto:number): Promise<any> {
    console.log(importe + ' | ' + fecha + ' | ' + idConcepto)
    return await fetch(`${this.urlSOAP}conceptos/services/isan`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imp="http://impuestos/"><soapenv:Header/><soapenv:Body><imp:obtenerRezagosActualizacionAdicionales><!--Optional:--><idConcepto>${idConcepto}</idConcepto><!--Optional:--><importe>${importe}</importe><!--Optional:--><fecha>${fecha}</fecha></imp:obtenerRezagosActualizacionAdicionales></soapenv:Body></soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8"},
      redirect: "follow"
    });
  }*/
  async getConceptoDetalle(idConcepto: number, monto: number): Promise<any> {
    return await fetch(`${this.urlSOAP}conceptos/services/conceptos`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:con="http://conceptos/">
      <soapenv:Header/>
      <soapenv:Body>
         <con:obtenUnConceptoDetalle>
            <!--Optional:-->
            <idConcepto>${idConcepto}</idConcepto>
            <!--Optional:-->
            <monto>${monto}</monto>
            <!--Optional:-->
            <cantidad>1</cantidad>
         </con:obtenUnConceptoDetalle>
      </soapenv:Body>
   </soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8" },
      redirect: "follow"
    });
  }
  async insertarPersona(
    nombre: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    rfc: string,
    curp: string,
    sexo: string,
    telefono: string,
    correo: string,
    dependencia: string,
    tipoDependencia: string,
    nivel: string,
    poder: string,
    folioDeclaracion: string,
    fecha: string,
    folioPago: string,
    lineaCaptura: string,
    numeroPoliza: string
  ): Promise<any> {
  
    const soapBody = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ofic="http://oficioshabilitacion/">
    <soapenv:Header/>
    <soapenv:Body>
      <ofic:insertaPeticion>
        <personaPago>
          <nombre>${nombre}</nombre>
          <apellidoPaterno>${apellidoPaterno}</apellidoPaterno>
          <apellidoMaterno>${apellidoMaterno}</apellidoMaterno>
          <rfc>${rfc}</rfc>
          <curp>${curp}</curp>
          <sexo>${sexo}</sexo>
          <telefono>${telefono}</telefono>
          <correo>${correo}</correo>
          <dependencia>${dependencia}</dependencia>
          <tipoDependencia>${tipoDependencia}</tipoDependencia>
          <nivel>${nivel}</nivel>
          <poder>${poder}</poder>
          <folioDeclaracion>${folioDeclaracion}</folioDeclaracion>
          <fecha>${fecha}</fecha>
          <folioPago>${folioPago}</folioPago>
          <lineaCaptura>${lineaCaptura}</lineaCaptura>
          <numeroPoliza>${numeroPoliza}</numeroPoliza>
          <validacion1>0</validacion1>
          <validacion2>0</validacion2>
          <validacion3>0</validacion3>
          <estado>En trámite</estado>
          <observacion>?</observacion>
          <fechaLiberacion>?</fechaLiberacion>
          <fechaLiberacionDate>?</fechaLiberacionDate>
          <codigo>?</codigo>
          <estampadoTiempo>?</estampadoTiempo>
          <mensaje>?</mensaje>
          <noCertificado>?</noCertificado>
          <selloDigital>?</selloDigital>
          <selloEstampado>?</selloEstampado>
          <urlValidacion>?</urlValidacion>
        </personaPago>
      </ofic:insertaPeticion>
    </soapenv:Body>
  </soapenv:Envelope>
  `;
  
   
  
    return await fetch(
      `${this.urlSOAP}oficiosHabilitacion/services/personaPago`,
      {
        method: "POST",
        body: soapBody,
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
        },
        redirect: "follow",
      }
    );
  }
  
  async validateVahicleOnDb(placa: string, no_serie: string): Promise<any> {
    return await fetch(`${this.urlSOAP}tramitesSMyT/services/SMyT`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:smyt="http://SMyT/">
      <soapenv:Header/>
      <soapenv:Body>
         <smyt:validarVehiculo>
            <!--Optional:-->
            <placa>${placa}</placa>
            <!--Optional:-->
            <noSerie>${no_serie}</noSerie>
         </smyt:validarVehiculo>
      </soapenv:Body>
   </soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8" },
      redirect: "follow"
    });
  }
  validateVehicleRest(placa: string, serie: string) {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    const body = { "placa": placa, "numeroSerie": serie }

    return this.http.post<{ data: boolean }>(`${this.baseUrlApp}/smyt/validarVehiculo`, body, { headers })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error al validar vehiculo:', error);
          return of(false); // Devolvemos false en lugar de null para mantener el mismo tipo de retorno
        })
      );
  }
  async validateFolioPago(serie: string, folio: string): Promise<any> {
    return await fetch(`${this.urlSOAP}tramitesSMyT/services/pagos`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pag="http://pagos/">
      <soapenv:Header/>
      <soapenv:Body>
         <pag:consultaFolioPago>
            <!--Optional:-->
            <serie>${serie}</serie>
            <!--Optional:-->
            <folio>${folio}</folio>
         </pag:consultaFolioPago>
      </soapenv:Body>
   </soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8" },
      redirect: "follow"
    });
  }

  public validateVehicle(
    serie: string,
    placa: string,
    mssg: number,
    tramite: number,
    tipoVehiculo: string,
    fechaFactura: string
  ) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const serieValue = formGroup.get(serie)?.value;
      const placaValue = formGroup.get(placa)?.value;

      if (!formGroup.get(serie)?.pristine) {
        this.validateVehicleRest(placaValue, serieValue).subscribe(isValid => {

          if (isValid) {
            formGroup.get(serie)?.setErrors(null);
            return null;
          }
          formGroup.get(serie)?.setErrors({ notEqual: true, error: 1 });
          return { notEqual: true };
        });
      }
      formGroup.get(serie)?.markAsTouched();
      formGroup.get(serie)?.setErrors(null);
      return null;
    };
  }

  /*validateVehicle(
    serieControlName: string,
    placaControlName: string,
    mssg: number,
    tramite: number,
    tipoVehiculo: string,
    fechaFactura: string
  ) {
    return (formGroup: AbstractControl): Promise<ValidationErrors | null> => {
      const serieControl = formGroup.get(serieControlName);
      const placaControl = formGroup.get(placaControlName);

      const serie = serieControl?.value;
      const placa = placaControl?.value;

      return new Promise((resolve) => {
        // If either field is empty, resolve with null (no validation error)
        if (!serie || !placa) {
          // Only mark as touched if the control exists
          if (serieControl) serieControl.markAsTouched();
          resolve(null);
          return;
        }

        this.validateVehicleRest(placa, serie).subscribe(
          (isValid) => {
            if (isValid) {
              if (serieControl) serieControl.setErrors(null);
              resolve(null);
            } else {
              if (serieControl) serieControl.setErrors({ notEqual: true, error: 1 });
              resolve({ notEqual: true });
            }
          },
          (error) => {
            console.error("Error validando vehículo", error);
            if (serieControl) serieControl.setErrors({ notEqual: true, error: 1 });
            resolve({ notEqual: true });
          }
        );
        formGroup.get(serie)?.markAsTouched();
        formGroup.get(serie)?.setErrors( null );
        resolve(null);
      });

    };
  }*/
  envioCDFI(title: string, serie: string, folio: string, para: string) {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    const body = { "lineaCaptura": title, "serie": serie, "folio": folio, "destinatario": para }

    return this.http.post<{ success: boolean }>(`${this.urlSOAP}timbrado/cfdi/correoCfdi`, body, { headers })
      .pipe(
        map(response => response.success),
        catchError(error => {
          console.error('Error al enviar CFDI:', error);
          return of(false); // Devolvemos false en lugar de null para mantener el mismo tipo de retorno
        })
      );
  }

  getMessages(): Observable<Messages[]> {
    return of(ListMessage.messages);
    /* MODIF: 12/12/2023 */
    //this.http.get<Messages[]>(this.urlMessage);
  }

  public getTokenEstrados(): String | null {
    let token2 = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwcmluY2lwYWwiOiJXU19TSDEiLCJzdWIiOiJVU1VBUklPIFBBR0lOQSBIQUNJRU5EQSIsIkF1dGhvcml0eSI6WyJST0xfUFJFRElBTF9QT1JUQUwiXSwic2lzdGVtYSI6MywibXVuaWNpcGlvIjoiQ1VFUk5BVkFDQSIsImlzcyI6ImFwcC5oYWNpZW5kYS5tb3JlbG9zLmdvYi5teCIsImlkTXVuaWNpcGlvIjo3LCJ1c2VySWQiOjIzNTEsImlhdCI6MTc2ODUxMzA0MCwidXJsIjpbIi9wcmVkaWFsL3BvcnRhbCIsIi9wcmVkaWFsL2NvbnN1bHRhIiwiL3ByZWRpYWwvbm90aWZpYWNpb25QYWdvIiwiL2NhdGFsb2dvL2xpc3RhciIsIi9wcmVkaWFsL2RldGFsbGVNdW5pY2ljcGlvIiwiL2ltcHVlc3Rvcy9jZWR1bGFyIiwiL2ltcHVlc3Rvcy9jZWR1bGFyIl0sImp0aSI6ImNkN2EzMmYxLTBiMWUtNDRmYy1iMGMzLWM0YWI5NDVjNzc5NSJ9.IWkRkyevBYQ0tIlcZQQNkjyjHV9TrpSDlz0DMYNFIgE";
    return token2;
  }

  uploadFile(file: FormData): Observable<ResponseStruct | null> {

    const token = this.getTokenEstrados();
    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<ResponseStruct>(this.baseUrlSiigem+'/impuestos/cedular', file, { headers })
      .pipe(
        map(data => {
          if (!!data.success) {
            return data
          }
          throw { message: data.mensaje, error: "Unauthorized", statusCode: 401 };
        }),
        catchError(err => { throw err })
      )


  }
}
