import { SmytService } from './../../../services/smyt.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

import ListaOficinas from '../../../../../../data/arreglos/smyt_oficinas_tramite.json';
import { Oficinas } from 'src/app/portal-hacienda/interface/portal-oficinas.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { NavigationStart, Router } from '@angular/router';
import { ValidateVehicle } from 'src/app/shared/interfaces/soap-valid-vehicle.interface';
import { Subscription } from 'rxjs';
import { ConvertXmlString } from 'src/app/shared/clases/convert-xml-string';
import { formatCurrency } from '@angular/common';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';


@Component({
  selector: 'smyt-pago-refrendo-page',
  templateUrl: './pago-refrendo-page.component.html',
  styles: [
  ]
})
export class PagoRefrendoPageComponent implements OnInit, OnDestroy  {

  /* Arreglo de oficinas de SMyT */
  public oficinasArr: Oficinas[] = ListaOficinas;
  /* Variable de tipo Interface-ValidateVehicle */
  private asJson!:ValidateVehicle;
  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;
  /* Se usa para obtener el nombre del concepto seleccionado y mostrarlo en el HTML */
  public nameConcept: string = '';
  /* Inicialización del formulario reactivo */
  public refrendoForm: FormGroup = this.fb.group({
    id:      [''],
    oficina: ['', [Validators.required]],
    placa:   ['ABC123D', [Validators.required, Validators.minLength(4)]],
    serie:   ['MARZ5', [Validators.required, Validators.minLength(5)]]
  },{
    validators: [this.validatorsService.existsSeries('serie','placa')]
  });
  /* Deshabilitar esta funcion, solo se creo para monitorear evento de navegación */
  public subscription: Subscription;
  /* Recibe un arreglo de tipo  ConvertXmlString*/
  private xmlSring: ConvertXmlString = new ConvertXmlString();

  constructor(
    private fb:FormBuilder,
    private _snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    private smytService: SmytService,
    private router: Router
  ) {
      this.subscription = router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          console.log('refresco el navegador Refrendo')
        }
      });
  }

  ngOnInit(): void {
    this.nameConcept = localStorage.getItem('concept')!;
  }

  ngOnDestroy(): void {
    console.log('Destruido');
    this.subscription.unsubscribe();
  }

  onSubmit(): void {
    this.isLoading = true;
    this.buttBlock = true;
    if (this.refrendoForm.invalid) {
      this.refrendoForm.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }

    let p = this.refrendoForm.get('placa')!.value;
    let s = this.refrendoForm.get('serie')?.value;

    //Llamar Servicio para ovtener datos del vehiculo y almacenarlo en LocalStor
    localStorage.setItem('vehicle_data', JSON.stringify({"placa":p,"serie":s}));
    this.smytService.validateVehicle({ "tramite": 1, "placa": p, "numeroSerie": s, "obtenerContribuyente":false })
      .subscribe(resp => {
        if (resp?.success) {
          localStorage.setItem('route_origen','smyt-refrendo')
          this.router.navigate(['/pagos/tabla-conceptos',1]);
          return
        }
        this._snackBar.openFromComponent(SnackBarComponent, {
          data: resp?.data,
          duration: 3000,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
        });

        this.isLoading = false;
        this.buttBlock = false;
      });
    /*this.smytService.validateVehicle(p!,s!)
      .then(response => response.text())
      .then(xml => {
        this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
        if(this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'] === 'EXITO') {
          localStorage.setItem('route_origen','smyt-refrendo')
          this.router.navigate(['/pagos/tabla-conceptos',1]);
          return
        }

        this._snackBar.openFromComponent(SnackBarComponent, {
          data: this.asJson['soap:Envelope']['soap:Body']['ns2:validarVehiculoResponse'].validarVehiculo['#text'],
          duration: 3000,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
        });

        this.isLoading = false;
        this.buttBlock = false;
      }).catch (err => console.log(err));*/

  }

  isValidField( field: string ) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField( this.refrendoForm, field );
  }
}
