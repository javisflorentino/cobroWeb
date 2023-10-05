import { Component, ViewChild, Pipe } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { FormAltaVehiculoComponent } from 'src/app/portal-hacienda/components/smyt/form-alta-vehiculo/form-alta-vehiculo.component';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt/smyt.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';



@Component({
  selector: 'smyt-alta-vehiculo-usado-page',
  templateUrl: './alta-vehiculo-usado-page.component.html',
  styles: [
  ],
})
export class AltaVehiculoUsadoPageComponent {

  aniosPago = [
    {name: '2018', value:'p2018'},
    {name: '2019', value:'p2019'},
    {name: '2020', value:'p2020'}

  ]

  subscription!: Subscription;
  submittedValue: any;




  //public procedeniaRequiredControl = new FormControl(false, Validators.required);

  public myForm: FormGroup = this.fb.group({
    modelo:       [ '',[ Validators.required ] ], // Entre 1900 - 2024
    procedencia:  [ 'NACIONAL', [Validators.required]], // Nacional, Extranjero
    uso_vehiculo: [ '' ], // se infiere que es particular
    cilindros:    [ '', [ Validators.required, Validators.max(16), Validators.pattern(this.validatorService.numberPattern)] ],
    centimetros:  [ {value: '', disabled: true}, [Validators.required, Validators.pattern(this.validatorService.numberPattern)]],
    pasajeros:    [ '', [ Validators.required] ],
    valor_factura:[ '', [ Validators.required, Validators.pattern(this.validatorService.numberPattern)]],
    placa_foranea:[ '', [ Validators.required] ],
    pago_baja_f:  [ false, [Validators.required] ],
    pagos:        this.fb.array(this.aniosPago.map(x => false))
  });
  // al seleccionar motociclista se habilita centimetros cubicos y se deshabilita cilindros
  //Si selecciona auto antiguo mando un alert
  public messages: Messages[] = [];

  public conceptTitle: string = '';

  //Se obtiene una referencia a todo el componente que se renderizó en este componente
  @ViewChild(FormAltaVehiculoComponent)
  private childComponent!: FormAltaVehiculoComponent;

  get ordersFormArray() {
    return this.myForm.controls['pagos'] as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private smytService: SmytService,
    private validatorService: ValidatorsService
  ) {}

  // Se implementó para la carga del formulario FormAltaVehiculoComponent
  ngAfterViewInit(): void {
    setTimeout( () => {
      this.myForm.addControl('oficinas',this.childComponent.myFormShared);
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
      //this.task.forEach(res => this.ordersFormArray.push(new FormControl(res)));
      //this.aniosPago.forEach(obj => this.ordersFormArray.push(this.fb.control(obj)));

      this.myForm.valueChanges.pipe(
        // debounceTime(1000)
       ).subscribe(
         data=>{
           console.log(data)
         }
       );

       const checkboxControl = this.ordersFormArray;
       checkboxControl.valueChanges.subscribe(checkbox => {
           checkboxControl.setValue(
               checkboxControl.value.map((value: any, i:any)  => value ? this.aniosPago[i].value : false),
               { emitEvent: false }
           );
       });

  }

  get recibeForm() {
    console.log('myFormSend')
    return null;
  }

  get oficinas() {
    console.log(this.myForm.get('oficinas'))
    return this.myForm.get('oficinas')?.disable;
  }

  calcularPago() {
    console.log(this.myForm.value);
    const checkboxControl = this.ordersFormArray;
    const formValue = {
      ...this.myForm.value,
      pagos: checkboxControl.value.filter((value: any) => !!value)
    }
    this.submittedValue = formValue;
  }
}
