import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TopLevel } from '../interfaces/calculo-conceptos';
import { DatosTramite } from '../interfaces/datos-tramite.interface';
import { ActivatedRoute } from '@angular/router';

import { environments } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SmyCalculoPagosService {

  private urlSmytParticular = `/${environments.appEnviroment}/smyt/particular`;//'serviciosHacienda/smyt/particular';
  private urlSmyPublico = `/${environments.appEnviroment}/smyt/publico`;//'serviciosHacienda/smyt/particular';
  private pagoLinea = `/pagoenlinea`;//'pagoenlinea';
  private otherPages = `/${environments.appEnviroment}/concepto/obtenerConcepto`
  private urlSOAP = `/`;

  constructor(private http: HttpClient, private activetedRouter: ActivatedRoute ) { }

  getCalculoPagos(datosTramite:DatosTramite): Observable<TopLevel> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<TopLevel>(`${this.urlSmytParticular}`,JSON.stringify(datosTramite),{headers});
  }

  getCalculoPagosPublico(datosTramite:DatosTramite): Observable<TopLevel> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<TopLevel>(`${this.urlSmyPublico}`,JSON.stringify(datosTramite),{headers});
  }

  otherCalculoPagos(datosTramite:object): Observable<TopLevel> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.user_server}:${environments.pass_server}`));

    return this.http.post<TopLevel>(`${this.otherPages}`,JSON.stringify(datosTramite),{headers});
  }
  sendDataPortalLinea() {
    //https://app.hacienda.morelos.gob.mx/pagoenlinea/
    let headers = new HttpHeaders();
    const params = 'numeroPoliza=12420495value1&fecha=2023-11-11&lineaCaptura=93001242049540408284&monto=820&nombrePago=PRUEBA PRUEBA PRUEBA&lineaDetallePago=prueba&pago215=2015&banco=Bancomer&extra=ECONOMIA-';
    const body=JSON.stringify(params);

    headers = headers.set("Content-Type", "application/x-www-form-urlencoded");

    return this.http.post(`${this.pagoLinea}/`,params,{headers})
    .subscribe(resp => {
      window.open(`${this.pagoLinea}/?data=${encodeURI(params)}`, '_blank')
    })
  }
  async getTaxpayData(dataVehicleLs: DatosTramite): Promise<any> {
    return await fetch(`${this.urlSOAP}tramitesSMyT/services/SMyT?wsdl`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:smyt="http://SMyT/">
      <soapenv:Header/>
      <soapenv:Body>
         <smyt:obtenEstatusVehiculo>
            <!--Optional:-->
            <placa>${dataVehicleLs.placa}</placa>
            <!--Optional:-->
            <noSerie>${dataVehicleLs.numeroSerie}</noSerie>
            <!--Optional:-->
            <usuario>?</usuario>
         </smyt:obtenEstatusVehiculo>
      </soapenv:Body>
   </soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8"},
      redirect: "follow"
    })
  }
}
