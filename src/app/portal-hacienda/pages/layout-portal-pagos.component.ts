/*
  Renderiza los componentes estaticos y compartidos Sidenav y Toolbar
  Renderiza los componentes definidos como rutas
*/
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnChanges, OnDestroy, OnInit, SimpleChanges, AfterViewInit, signal, computed, effect } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SidenavConceptosComponent } from 'src/app/shared/components/sidenav-conceptos/sidenav-conceptos.component';
import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';

@Component({
  selector: 'app-layout-portal-pagos',
  templateUrl: './layout-portal-pagos.component.html',
  styles: [
  ]
})
export class LayoutPortalPagosComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit  {

  /* Se enviara a shared-sidenav-conceptos y cuando se presiona el icono de menu del Toolbar se genera un aleatorio */
  public sendActionSidenav: number = 0;
  public sendValCardSidenav: Subject<number> = new Subject<number>();
  // Envia un valor numerico aleatorio mayot a 0 para indicar que se quiere ir al home. Se envia al Sidenav que limpiara variables al recibir
  public sendActEraseLocalStor: number = 0;

  /* se envia a shared-toolbar */
  public senNameDep: string = 'SECRETARÍA DE HACIENDA Y CRÉDITO PUBLICO';

  public valCard: number = 0;

  // Recibe el nombre del concepto de sidenav-conceptos y lo envia al shared-toolbar
  public receiveNameConcept!: string;

  public productObservable!: Observable<number>;

  public sizeDisplay!: string;

  destroyed = new Subject<void>();

  /* ChildAlerts of Output */
  public chilAlert: String = '';

  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  /*private sideNav!:SidenavConceptosComponent;

  @HostListener('click')
  clickOutside() {
      console.log(this.sideNav.changSidenav.toggle)
  }*/

  public flag:boolean = true;


  constructor( private breakpointObserver: BreakpointObserver, private _snackBar: MatSnackBar ) {
    this.mediaQuery();
  }

  ngAfterViewInit(): void {
    /*setTimeout(()=>{
      this.flag = false;
    },1000)*/
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void { }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  changeChilAlert(event:string) {
    this.openSnackBar(event);
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 5500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
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

  /* Recibe valor del shared-toolbar*/
  get actionOnSidenav() {
    this.sendActionSidenav = Math.random();
    return true;
  }

  reciveValCard(val:number, nameDep: string) {
    this.sendActionSidenav = val;
    this.sendValCardSidenav.next(val);
    this.senNameDep = nameDep;
    localStorage.removeItem('idParent');
  }

  redirectHome(event: boolean): void {
    this.senNameDep = 'SECRETARIA DE HACIENDA Y CREDITO PUBLICO';
    this.receiveNameConcept = '';
    this.sendActEraseLocalStor = Math.random();
  }
  reciveNameConcept(nameConcep:string){
    this.receiveNameConcept = ' - [ ' + nameConcep + ' ]';
  }
}
