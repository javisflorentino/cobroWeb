import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Poliza } from 'src/app/portal-hacienda/interface/portal-datos-poliza.interface';
import { TopLevel } from '../../interfaces/calculo-conceptos';

@Component({
  selector: 'app-shared-datos-poliza',
  templateUrl: './shared-datos-poliza.component.html',
  styles: [
  ]
})
export class SharedDatosPolizaComponent implements OnInit {

  public links = ['Depósito Bancario', 'Tarjeta de Crédito o Débito'];
  public links_icons = ['account_balance','credit_card'];
  public position: boolean[] = [true,false];

  private url = 'https://app.hacienda.morelos.gob.mx/recibo/poliza/imprimirPoliza?lineaCaptura=';

  @ViewChild('formPL', { read: ElementRef })
  private paytmForm!: ElementRef;


  public datosPoliza:Poliza = {
    fechaVencimiento: '',
    numeroPoliza:     '',
    lineaCaptura:     '',
    total:            0,
  };

  private contribuyenteArr = {} as TopLevel;

  public myForm = this.fb.group({
    numeroPoliza: [''],
    lineaCaptura: [''],
    monto: [''],
    nombrePago: [''],
    lineaDetallePago: [''],
    pago2015: ['2015'],
    banco: ['Bancomer'],
    extra: ['ECONOMIA-'],
    fecha: ['']
  })

  constructor( private fb: FormBuilder ) {}

  ngOnInit(): void {
    this.contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente')!);
    if (!this.contribuyenteArr.data.contribuyente) {
      this.contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente_only')!);
    }
    this.datosPoliza = JSON.parse(localStorage.getItem('datos_poliza')!);
    this.myForm.reset({
      numeroPoliza:this.datosPoliza.numeroPoliza,
      lineaCaptura:this.datosPoliza.lineaCaptura,
      monto: this.datosPoliza.total.toString(),
      nombrePago: this.contribuyenteArr.data.contribuyente.nombre + ' ' + this.contribuyenteArr.data.contribuyente.primerApellido + ' ' + this.contribuyenteArr.data.contribuyente.segundoApellido,
      lineaDetallePago: this.contribuyenteArr.data.lineaDetalle,
      pago2015: '2015',
      banco: 'Bancomer',
      extra: 'ECONOMIA-',
      fecha: String(new Date().getDate()+4).toString()
    })
  }


  activeLink = this.links[0];


  activeLinkFunct(link:number):void {
    console.log('entra = ' + link)
    this.activeLink = this.links[link];
    this.position[link] = true;
    this.position[(link>0)?0:1] = false;
  }

  getPoliza() {
    window.open(`${this.url}${this.datosPoliza.lineaCaptura}`);
  }

  portalPagoLinea() {
    this.paytmForm.nativeElement.submit();
  }

}
