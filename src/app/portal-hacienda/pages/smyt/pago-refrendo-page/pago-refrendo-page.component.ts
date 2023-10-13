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

  private horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  private verticalPosition: MatSnackBarVerticalPosition = 'top';

  private debounce: Subject<string> = new Subject<string>();
  private debouncerSubscription?: Subscription;

  private asJson!:ValidateVehicle;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  public buttBlock = false;



  public refrendoForm = this.fb.group({
    id:      [''],
    oficina: ['', [Validators.required]],
    placa:   ['', [Validators.required, Validators.minLength(4)]],
    serie:   ['', [Validators.required, Validators.minLength(5)]]
  },{
    Validators: [this.validatorsService.existsSeries('serie','placa')]
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
    /*this.debouncerSubscription = this.debounce
    .pipe(
      debounceTime(500)
    )
    .subscribe( value => {
      this.isLoading = true;

      const p = this.refrendoForm.get('placa')?.value;
      this.smytService.validateVehicle(p!,value)
      .then(response => response.text())
      .then(xml => {
        console.log(xml);
        this.asJson = this.xmlStringToJson(xml.toString());
        this.isLoading = false;
        if(this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'] !== 'EXITO') {
          this.openSnackBar(this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'])
          //this.buttBlock = true;
          return
        }

      }).catch (err => console.log(err));
    });*/
  }
  onKeyPress( searchTerm: string ) {
    this.debounce.next( searchTerm );
  }

  ngOnDestroy(): void {
    console.log('Destruido');
    this.debouncerSubscription?.unsubscribe();
  }

  onSubmit(): void {
    this.isLoading = true;
    if (this.refrendoForm.invalid) {
      this.alertMesage = true
      //this.openSnackBar('Verifique los campos requeridos');
      this.refrendoForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    let p = this.refrendoForm.get('placa')!.value;
    let s = this.refrendoForm.get('serie')?.value;

    //Llamar Servicio para ovtener datos del vehiculo y almacenarlo en LocalStor
    localStorage.setItem('vehicle_data', JSON.stringify({"placa":p,"serie":s}));

    this.smytService.validateVehicle(p!,s!)
      .then(response => response.text())
      .then(xml => {
        this.asJson = this.xmlStringToJson(xml.toString());
        if(this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'] === 'EXITO') {
          this.router.navigate(['/pagos/tabla-conceptos',1]);
          return
        }
        this.openSnackBar(this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text']);
        this.isLoading = false;
      }).catch (err => console.log(err));

  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000
    });
  }

  isValidField( field: string ) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField( this.refrendoForm, field );
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
