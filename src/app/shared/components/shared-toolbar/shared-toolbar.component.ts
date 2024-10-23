import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'shared-toolbar',
  templateUrl: './shared-toolbar.component.html',
  styleUrls: ['./shared-toolbar.component.css']
})
export class SharedToolbarComponent {

  @Input()
  public viewResolution!: string;
   /*Recibe el nombre de la Dependencia seleccionada - origen dependencias-cards */
  @Input()
  public receiveNameDep: string = '';

  /* EMITE VALOR BOOLEAN AL PADRE LAYOUT  */
  @Output()
  private openOrCloseSidenav = new EventEmitter<boolean>();
  /* NOTA: SE DIO CLICK EN HOME, NOTIFICAR AL PADRE PARA QUE SE LIMPIEN VARIABLES */
  @Output()
  private closeLocalStor = new EventEmitter<boolean>();

  /* CONTROLA EL VALOR DEL EVENTO AL DAR CLICK EN EL ICONO MENU */
  private controlElemnentMenu: boolean = false;

  redirectPagos(): void{
    this.closeLocalStor.emit(true);
  }

  sidenavAction(): void{
    this.controlElemnentMenu=!this.controlElemnentMenu
    /* EMITE VALORES BOOLEAN AL PADRE LAYOUT PAR INDICARLE QUE SE CLICKIO MENU */
    this.openOrCloseSidenav.emit(!this.controlElemnentMenu);
  }
}
