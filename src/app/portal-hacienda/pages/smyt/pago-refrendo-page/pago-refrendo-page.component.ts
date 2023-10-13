import { SmytService } from './../../../services/smyt.service';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

import ListaOficinas from '../../../../../../data/arreglos/smyt_oficinas_tramite.json';
import { Oficinas } from 'src/app/portal-hacienda/interface/portal-oficinas.interface';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { NavigationStart, Router } from '@angular/router';
import { ValidateVehicle } from 'src/app/shared/interfaces/soap-valid-vehicle.interface';
import { Subject, Subscription, debounceTime } from 'rxjs';

import {LoadSpinnerComponent} from '../../../../shared/components/load-spinner/load-spinner.component'


@Component({
  selector: 'smyt-pago-refrendo-page',
  templateUrl: './pago-refrendo-page.component.html',
  styles: [
  ]
})
export class PagoRefrendoPageComponent implements OnInit, OnDestroy  {

  public oficinasArr: Oficinas[] = ListaOficinas;
  public alertMesage: boolean = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  private debounce: Subject<string> = new Subject<string>();
  private debouncerSubscription?: Subscription;

  private asJson!:ValidateVehicle;

  public isLoading: boolean = false;



  public refrendoForm = this.fb.group({
    id:      [''],
    oficina: ['', [Validators.required]],
    placa:   ['RBK258A', [Validators.required, Validators.minLength(4)]],
    serie:   ['82887', [Validators.required, Validators.minLength(5)]]
  });

  subscription: Subscription;

  constructor(
    private fb:FormBuilder,
    private _snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    private smytService: SmytService,
    private router: Router ) {
      this.subscription = router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          console.log('refresco el navegador Refrendo')
        }
    });
    }



  ngOnInit(): void {
    /* Crean un observable y escucha los cambios  */
    this.debouncerSubscription = this.debounce
    .pipe(
      debounceTime(500)
    )
    .subscribe( value => {
      const p = this.refrendoForm.get('placa')?.value;
      this.smytService.validateVehicle(p!,value)
      .then(response => response.text())
      .then(xml => {
        this.asJson = this.xmlStringToJson(xml.toString());
        this.isLoading = false;
        if(this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'] !== 'EXITO') {
          this.openSnackBar(this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'])
          return
        }

      }).catch (err => console.log(err));
    });
  }
  onKeyPress( searchTerm: string ) {
    this.isLoading = true;
    this.debounce.next( searchTerm );
  }

  ngOnDestroy(): void {
    console.log('Destruido');
    this.debouncerSubscription?.unsubscribe();
  }

  isValidField() {

  }

  onSubmit(): void {
    this.isLoading = true;
    if (this.refrendoForm.invalid) {
      this.alertMesage = true
      this.openSnackBar('Verifique los campos requeridos');
      this.refrendoForm.markAllAsTouched();
      return;
    }

    let p = this.refrendoForm.get('placa')!.value;
    let s = this.refrendoForm.get('serie')?.value;

    this.smytService.validateVehicle(p!,s!)
      .then(response => response.text())
      .then(xml => {
        this.asJson = this.xmlStringToJson(xml.toString());
        if(this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'] === 'EXITO') {
          this.router.navigate(['/pagos/tabla-conceptos',1]);
          return
        }
        this.openSnackBar(this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text']);
      }).catch (err => console.log(err));

  }
  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 5000
    });
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
