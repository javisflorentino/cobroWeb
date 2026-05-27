import { Component, ElementRef, EventEmitter, inject, Input, Output, signal, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MenuService } from '../../services/menu.service';
import { MenuConceptos } from '../../interfaces/shared-conceptos.interface';
import { Router } from '@angular/router';


@Component({
  selector: 'shared-toolbar',
  templateUrl: './shared-toolbar.component.html',
  styleUrls: ['./shared-toolbar.component.css']
})
export class SharedToolbarComponent {

  public flagSearchTramite = signal<boolean>(false);
  /* NOTA: CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading: boolean = false;

   private router = inject(Router);

  @ViewChild('tagInput')
  public tagInput!: ElementRef<HTMLInputElement>;

  @ViewChild('tagInput') trigger: MatMenuTrigger | undefined;

  /*NOTA: LISTA DE CONCEPTOS DE LA DEPENDENCIA SELECCIONADA */
    public cardsArr: MenuConceptos[] = [];


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

  /* TODO: EMITE EL VALOR BOOL AL PADRE PARA ACTIVAR O DESACTIVAR EL TOOLBARMENU */
  @Output()
  private actionOnToolbarMenu = new EventEmitter<boolean>();

  /*TODO: CONTROLA EL VALOR BOOL QUE DETERMIA SE ACTIVE O DESACTIVE EL TOOLBAR MENU */
  public flagActivitie = false;

  /* CONTROLA EL VALOR DEL EVENTO AL DAR CLICK EN EL ICONO MENU */
  private controlElemnentMenu: boolean = false;

  private generalService = inject(MenuService);

  redirectPagos(): void{
    this.closeLocalStor.emit(true);
  }

  /*TODO: EMITE UN VALOR BOOL AL PADRE PARA ACTIVAR O DESACTIVAR EL TOOLBARMENU */
  activeOrInactiveToolbarMenu(){
    this.flagActivitie = !this.flagActivitie;
    this.actionOnToolbarMenu.emit(this.flagActivitie)
  }

  sidenavAction(): void{
    this.controlElemnentMenu=!this.controlElemnentMenu
    /* EMITE VALORES BOOLEAN AL PADRE LAYOUT PAR INDICARLE QUE SE CLICKIO MENU */
    this.openOrCloseSidenav.emit(!this.controlElemnentMenu);
  }

  searchTramite(){
    //this.trigger?.openMenu();

    this.isLoading = true;
    this.generalService.getConceptsByTitle(this.tagInput.nativeElement.value)
     .subscribe({
      next:(res) => {
          this.isLoading = false;
          if (res.length > 0) {
            this.cardsArr = res;
            this.trigger?.openMenu();
            return;
          }
          this.cardsArr = [];
          return;
      }
     })
  }

  showAunHideInputSearch(){
    this.flagSearchTramite.set(!this.flagSearchTramite());
  }

  redirectToTramite(url:string,idConcepto:number,formulario:number,gestora:number,tipoMov:number){
    console.log(url)
    let redirect = url;
    sessionStorage.setItem('gestora',gestora.toString());
    sessionStorage.setItem('route_origen',url);
    sessionStorage.setItem('movimiento',tipoMov.toString())
    /*if(url=='tabla-conceptos') {
      redirect += '/' + idConcepto + '/' + formulario;
    }*/
    redirect += '/' + idConcepto + '/' + formulario;
    console.log(redirect)
    this.router.navigate(['/pagos/' + redirect]);
  }
}
