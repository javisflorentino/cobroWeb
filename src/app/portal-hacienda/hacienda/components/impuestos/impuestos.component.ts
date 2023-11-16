import { Component } from '@angular/core';
import { MessageSmyt } from 'src/app/shared/interfaces/message-smyt.interface';

import ListMsgHacienda from '../../../../../../data/arreglos/hacienda_mensajes.json'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

@Component({
  selector: 'hacienda-impuestos-shared',
  templateUrl: './impuestos.component.html',
  styles: [
  ]
})
export class ImpuestosComponent {

  // Lista de mensajes para el formulario
  public mssgArr: MessageSmyt[] = ListMsgHacienda.hacienda_impuestos;

  public myFormImpuestos: FormGroup = this.fb.group({
    impuesto:      [ 1,[Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberPattern)] ],
    actualizacion: [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberPattern)]],
    recargo:       [0, [Validators.required, Validators.min(0), Validators.pattern(this.validatorService.numberPattern)]]
  })

  constructor( private fb: FormBuilder, private validatorService: ValidatorsService, ) {}

}
