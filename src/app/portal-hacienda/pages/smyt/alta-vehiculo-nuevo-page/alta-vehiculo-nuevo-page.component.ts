import { AfterViewInit, Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment, { Moment } from 'moment';
import { FormAltaVehiculoComponent } from 'src/app/portal-hacienda/components/smyt/form-alta-vehiculo/form-alta-vehiculo.component';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { ValidatorsService } from '../../../../shared/services/validators.service';

@Component({
  selector: 'smyt-alta-vehiculo-nuevo-page',
  templateUrl: './alta-vehiculo-nuevo-page.component.html',
  styles: [
  ]
})
export class AltaVehiculoNuevoPageComponent implements OnInit, AfterViewInit {

  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  public myForm: FormGroup = this.fb.group({});

  public messages: Messages[] = [];

  public conceptTitle: string = '';

  //Se obtiene una referencia a todo el componente que se renderizó en este componente
  @ViewChild(FormAltaVehiculoComponent)
  private childComponent!: FormAltaVehiculoComponent;

  constructor( private fb: FormBuilder, private smytService: SmytService, private validatorsService: ValidatorsService ) {}

  // Se implementó para la carga del formulario FormAltaVehiculoComponent
  ngAfterViewInit(): void {
    setTimeout( () => {
      this.myForm.addControl('oficina_tramite',this.childComponent.myFormShared);
      this.childComponent.myFormShared.setParent(this.myForm);
    });
    //form.setParent(this.form);
  }

  ngOnInit(): void {
    this.conceptTitle = localStorage.getItem('concept')!;
    this.smytService.getMessages()
      .subscribe( message => {
        this.messages = message;
      });
  }

  get recibeForm() {
    console.log('myFormSend')
    return null;
  }

  calcularPago() {
    let dateOfFactura: Moment =this.myForm.get('oficina_tramite')?.get('fecha_factura')?.value;
    //dateOfFactura = this.myForm.get('oficina_tramite')?.get('fecha_factura')?.value
    //dateOfFactura.
    let pattern = new RegExp(this.validatorsService.datePath);
    console.log('FEchaValida: ' + dateOfFactura.toObject().date + '/' + (dateOfFactura.toObject().months + 1) + '/' + dateOfFactura.toObject().years)

    console.log(pattern.test(dateOfFactura.toObject().date + '/' + (dateOfFactura.toObject().months + 1) + '/' + dateOfFactura.toObject().years))
    this.isLoading = true;
    this.buttBlock = true;
    if ( this.myForm.invalid ) {
      this.myForm.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }
    console.log('SiguientePado-calcularPago')
  }


}
