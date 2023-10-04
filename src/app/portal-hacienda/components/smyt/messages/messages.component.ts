import { Component, Input } from '@angular/core';
import { Messages } from 'src/app/portal-hacienda/interface/portal-message.interface';

@Component({
  selector: 'smyt-messages',
  templateUrl: './messages.component.html',
  styles: [
  ]
})
export class MessagesComponent {
  @Input()
  public messageArr: Messages[] = [];
}
