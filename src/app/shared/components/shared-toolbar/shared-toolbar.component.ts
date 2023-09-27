import { Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'shared-toolbar',
  templateUrl: './shared-toolbar.component.html',
  styles: [
  ]
})
export class SharedToolbarComponent {

  @Output()
  private openOrCloseSidenav = new EventEmitter<boolean>()

  sidenavAction(): void {
    console.log('Action Shared Tooltip')
    this.openOrCloseSidenav.emit(true);
  }
}
