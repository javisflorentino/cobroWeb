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
  public isLoading: boolean = false;

  private router = inject(Router);

  // Mantiene la referencia al campo de entrada de texto
  @ViewChild('tagInput') public tagInput!: ElementRef<HTMLInputElement>;

  // Corregido: Ahora mapea correctamente al disparador del menú desplegable
  @ViewChild('menuTrigger') public trigger!: MatMenuTrigger;

  public cardsArr: MenuConceptos[] = [];

  @Input() public viewResolution!: string;
  @Input() public receiveNameDep: string = '';

  @Output() private openOrCloseSidenav = new EventEmitter<boolean>();
  @Output() private closeLocalStor = new EventEmitter<boolean>();
  @Output() private actionOnToolbarMenu = new EventEmitter<boolean>();

  public flagActivitie = false;
  private controlElemnentMenu: boolean = false;
  private generalService = inject(MenuService);

  redirectPagos(): void {
    this.closeLocalStor.emit(true);
  }

  activeOrInactiveToolbarMenu() {
    this.flagActivitie = !this.flagActivitie;
    this.actionOnToolbarMenu.emit(this.flagActivitie);
  }

  sidenavAction(): void {
    this.controlElemnentMenu = !this.controlElemnentMenu;
    this.openOrCloseSidenav.emit(!this.controlElemnentMenu);
  }

  searchTramite() {
    const searchWord = this.tagInput.nativeElement.value;
    if (!searchWord || !searchWord.trim()) return;

    this.isLoading = true;
    this.generalService.getConceptsByTitle(searchWord).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.length > 0) {
          this.cardsArr = res;
          // Abre el menú programáticamente una vez que los datos cargan
          setTimeout(() => this.trigger?.openMenu(), 50);
          return;
        }
        this.cardsArr = [];
        // Abre el menú para mostrar el mensaje de "No se encontró información"
        setTimeout(() => this.trigger?.openMenu(), 50);
      },
      error: () => {
        this.isLoading = false;
        this.cardsArr = [];
      }
    });
  }

  showAunHideInputSearch() {
    this.flagSearchTramite.set(!this.flagSearchTramite());
  }

  redirectToTramite(url: string, idConcepto: number, formulario: number, gestora: number, tipoMov: number) {
    let redirect = url;
    sessionStorage.setItem('gestora', gestora.toString());
    sessionStorage.setItem('route_origen', url);
    sessionStorage.setItem('movimiento', tipoMov.toString());
    
    redirect += '/' + idConcepto + '/' + formulario;
    this.router.navigate(['/pagos/' + redirect]);
  }
}