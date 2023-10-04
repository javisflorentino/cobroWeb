import { Component, EventEmitter, Input, Output } from '@angular/core';
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

  @Input()
  public receiveNameDep: string = '';

  @Input()
  public nameConceptToolbar: string = '';

  constructor( private router: Router) {}

  sidenavAction(): void {
    this.openOrCloseSidenav.emit(true);
  }

  redirectPagos(): void {
    //localStorage.clear();
    //this.router.navigate(['/pagos']);
    this.closeLocalStor.emit(true);
  }
}
