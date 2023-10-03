import { AfterViewInit, Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormAltaVehiculoComponent } from 'src/app/portal-hacienda/components/smyt/form-alta-vehiculo/form-alta-vehiculo.component';

@Component({
  selector: 'app-alta-vehiculo-nuevo-page',
  templateUrl: './alta-vehiculo-nuevo-page.component.html',
  styles: [
  ]
})
export class AltaVehiculoNuevoPageComponent implements OnInit, AfterViewInit {

  public myForm: FormGroup = this.fb.group({});

  @ViewChild('ChildComponent')
  private childComponent!: FormAltaVehiculoComponent;

  constructor( private fb: FormBuilder ) {}

  ngAfterViewInit(): void {
    console.log("Aqui Esta: " + this.childComponent.myFormShared);
    //this.myForm.addControl('oficina_tramite',this.childComponent.myFormShared);
    //this.childComponent.myFormShared.setParent(this.myForm);
    //form.setParent(this.form);
  }
  ngOnInit(): void {}

  get recibeForm() {
    console.log('myFormSend')
    return null;
  }

  calcularPago() {
    console.log(this.myForm.value);
  }
}
