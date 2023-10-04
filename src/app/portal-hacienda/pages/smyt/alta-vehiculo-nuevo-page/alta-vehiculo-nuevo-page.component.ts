import { AfterViewInit, Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormAltaVehiculoComponent } from 'src/app/portal-hacienda/components/smyt/form-alta-vehiculo/form-alta-vehiculo.component';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt/smyt.service';

@Component({
  selector: 'app-alta-vehiculo-nuevo-page',
  templateUrl: './alta-vehiculo-nuevo-page.component.html',
  styles: [
  ]
})
export class AltaVehiculoNuevoPageComponent implements OnInit, AfterViewInit {

  public myForm: FormGroup = this.fb.group({});

  public messages: Messages[] = [];

  @ViewChild(FormAltaVehiculoComponent)
  private childComponent!: FormAltaVehiculoComponent;

  constructor( private fb: FormBuilder, private smytService: SmytService ) {}

  ngAfterViewInit(): void {
    setTimeout( () => {
    this.myForm.addControl('oficina_tramite',this.childComponent.myFormShared);
    this.childComponent.myFormShared.setParent(this.myForm);
    });
    //form.setParent(this.form);
  }
  ngOnInit(): void {
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
    console.log(this.myForm.value);
  }
}
