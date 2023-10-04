import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'shared-toolbar',
  templateUrl: './shared-toolbar.component.html',
  styles: [
  ]
})
export class SharedToolbarComponent {

  @Output()
  private openOrCloseSidenav = new EventEmitter<boolean>();

  @Output()
  private closeLocalStor = new EventEmitter<boolean>();

  constructor( private router: Router) {}

  sidenavAction(): void {
    console.log('Action Shared Tooltip')
    this.openOrCloseSidenav.emit(true);
  }

  redirectPagos(): void {
    //localStorage.clear();
    //this.router.navigate(['/pagos']);
    this.closeLocalStor.emit(true);
  }
}
