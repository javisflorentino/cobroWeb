import { Component, Input } from '@angular/core';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';

@Component({
  selector: 'messages-hacienda',
  templateUrl: './messages-hacienda.component.html',
  styles: [
  ]
})
export class MessagesHaciendaComponent {
  @Input()
  public messageArr: Messages[] = [];
  @Input()
  public messageArr_other: Messages[] = [];
}
