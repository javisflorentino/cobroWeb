/*
  Renderiza los componentes estaticos y compartidos Sidenav y Toolbar
  Renderiza los componentes definidos como rutas
*/
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';
import { MenuConceptos } from 'src/app/shared/interfaces/shared-conceptos.interface';

@Component({
  selector: 'app-layout-portal-pagos',
  templateUrl: './layout-portal-pagos.component.html',
  styleUrls: ['./layout-portal-pagos.component.css']
})
export class LayoutPortalPagosComponent implements OnInit, OnDestroy  {

  /* NOTA: SE CREA OBSERVABLE QUE EMITIRA VALOR AL COMPONENTE SIDENAV   */
  public sendActionSidenav: Subject<boolean> = new Subject<boolean>();
  /* NOTA: SE CREA OBSERVABLE QUE EMITIRA UN OBJETO DE LA DEPENDENCIA SELECCIONADA AL COMPONENTE SIDENAV   */
  public valCardSubjectEmitt: Subject<MenuConceptos[]> = new Subject<MenuConceptos[]>();//PortalMenu[]> = new Subject<PortalMenu[]>();

  private _snackBar = inject(MatSnackBar);

  /* NOTA: RECIBE EL NOMBRE DEL CONCEPTO DEL SIDENAV PARA SU MANIPULACION */
  public receiveNameConcept!: string;

  /* se envia a shared-toolbar */
  public senNameDep: string = 'SECRETARÍA DE HACIENDA';

  // Envia un valor numerico aleatorio mayot a 0 para indicar que se quiere ir al home. Se envia al Sidenav que limpiara variables al recibir
  public sendActEraseLocalStor: Subject<boolean> = new Subject<boolean>();//: boolean = false;

  public controlView: boolean = false;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  private destroyed = new Subject<void>();
  /* CONTROLAR LA RESOLUCION DE LA PANTALLA */
  public sizeDisplay!: string;
  /* CONTROLAR EL TIPO DE RESOLUCIONES */
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);
  /* INYECCION DE LA DEPENDECIA QUE ESCUCHA  LA RESOLUCION ACTUAL */
  private breakpointObserver = inject(BreakpointObserver);

  public flagActivitie = false;

  constructor() {
    this.mediaQuery();
  }



  ngOnInit(): void {
    //this.sendActionSidenav.subscribe();
  }

  ngOnDestroy(): void {
    console.log('DESTROY LAYOUT')
    this.sendActionSidenav.unsubscribe();
    this.valCardSubjectEmitt.unsubscribe();
    this.sendActEraseLocalStor.unsubscribe();

    this.destroyed.next();
    this.destroyed.unsubscribe();
  }

  /* RECIBE VALORES DEL COMPONENTE HIJO TOOLBAR AL PRECIONAR MENU*/
  actionOnSidenav(val: boolean): void {
    /* ACTUALIZA EL VALOR A EMITIR AL HIJO SIDENAV */
    this.sendActionSidenav.next(val);
    return;
  }

  activeOrInactiveToolbarMenu(val: boolean){
    console.log('Activar o Desactivar Menu:::' + val)
    this.flagActivitie = val;
  }

  /* NOTA: DISPARA ALERTAS  */
  triggerAlert(event: string) {
    this.openSnackBar(event);
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message, duration: 5500, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
    });
  }

  /* RECIBE UN OBJETO DE LA DEPENDENCIA SELECIONADA DEL HIJO DEPENDENCIAS-CARD */
  reciveValCard(valCard: MenuConceptos[]){//PortalMenu[]) {
    this.valCardSubjectEmitt.next(valCard);
    //this.sendActionSidenav = val;
    //this.sendValCardSidenav.next(val);
    this.senNameDep = valCard[0].titulo;
    //localStorage.removeItem('idParent');
  }

  /* NOTA: RECIBE NOMBRE DEL CONCEPTO CELECCIONADO EN SIDENAV */
  reciveNameConcept(nameConcep: string) {
    this.receiveNameConcept = ' - [ ' + nameConcep + ' ]';
    this.controlView = true;
  }

  redirectHome(event: boolean): void {
    this.controlView = false;
    this.senNameDep = 'SECRETARÍA DE HACIENDA';
    this.receiveNameConcept = '';
    //this.sendActEraseLocalStor = true;
    this.sendActEraseLocalStor.next(true);
  }

  public mediaQuery() {

    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.sizeDisplay = this.displayNameMap.get(query) ?? 'Unknown';
          }
        }
      });


  }
}
