import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { filter } from 'rxjs';
import { Router } from '@angular/router';
import { DatosPoliza } from '../../interfaces/datos-poliza';

@Component({
  selector: 'shared-datos-contribuyente',
  templateUrl: './datos-contribuyente.component.html',
  styleUrls: ['./datos-contribuyente.component.css']
})
export class DatosContribuyenteComponent implements OnInit {

  public contribuyenteArr: Object[] = [];
  public contribDom: Object[] = [];

  public messages: Messages[] = [];
  public messages_other: Messages[] = [];

  private dataPoliza: DatosPoliza = {
    sistema: '',
    movimiento: '',
    total: 0,
    rfc: '',
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    razonSocial: '',
    tipoPersona: '',
    origen: '',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    municipio: '',
    estado: '',
    codigoPostal: '',
    observaciones: '',
    datosAdicionales: '',
    detalle: '',
};

  // estos informacion se enviara desde el modulo de SMYT
  private sistema: number = 46;
  private movimiento: number = 100

  public myFormContribuyente: FormGroup = this.fb.group({
    tipoPersona: ['',[Validators.required]],
    nombre: [],
    primerApellido: [],
    segundoApellido: [],
    razonSocial: [],
    rfc: [],
    curp: [],
    domicilio: this.fb.group({
      calle: [],
      numeroExterior: [],
      numeroInterior: [],
      colonia: [],
      codigoPostal: [],
      municipio: [],
      observaciones: []
    })
  });

  constructor(
    private fb:FormBuilder,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente')!);

    this.myFormContribuyente.reset(this.contribuyenteArr[0])
    this.myFormContribuyente.get('domicilio')?.reset(this.contribuyenteArr[1]);

  }

  generarPoliza(): void {
   this.dataPoliza.sistema = this.sistema.toString();
   this.dataPoliza.movimiento = this.movimiento.toString();

   Object.entries(this.contribuyenteArr[3]).forEach(val => { this.dataPoliza.total = val[1]; })//this.dataPoliza.total = Object.entries(this.contribuyenteArr[3]).forEach((title,val:number) => val.toString );
   Object.entries(this.contribuyenteArr[0]).map(([key,val]) => {
    Object.entries(this.dataPoliza).map(([llave,valor])=> console.log(llave))
   })
   //this.dataPoliza.
    console.log(this.dataPoliza)
   //Object.entries(this.contribuyenteArr[0]).forEach(r => console.log(r[1]))
    //this.router.navigate(['pagos/generar_poliza']);
  }

  isValidField(field: string) {

  }
}
