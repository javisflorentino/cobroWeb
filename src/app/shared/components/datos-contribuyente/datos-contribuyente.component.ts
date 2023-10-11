import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { filter } from 'rxjs';

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

  constructor( private fb:FormBuilder) {

  }
  ngOnInit(): void {
    this.contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente')!);

    this.myFormContribuyente.reset(this.contribuyenteArr[0])
    this.myFormContribuyente.get('domicilio')?.reset(this.contribuyenteArr[1]);

  }

  generarPoliza() {}

  isValidField(field: string) {

  }
}
