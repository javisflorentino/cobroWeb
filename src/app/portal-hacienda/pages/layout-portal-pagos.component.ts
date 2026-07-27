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
export class LayoutPortalPagosComponent implements OnInit, OnDestroy {

  public sendActionSidenav: Subject<boolean> = new Subject<boolean>();
  public valCardSubjectEmitt: Subject<MenuConceptos[]> = new Subject<MenuConceptos[]>();

  private _snackBar = inject(MatSnackBar);

  public receiveNameConcept!: string;
  public senNameDep: string = 'SECRETARÍA DE ADMINISTRACIÓN Y FINANZAS';
  public sendActEraseLocalStor: Subject<boolean> = new Subject<boolean>();

  public controlView: boolean = false;
  public isLoading: boolean = false;

  private destroyed = new Subject<void>();
  public sizeDisplay!: string;
  
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);
  
  private breakpointObserver = inject(BreakpointObserver);
  public flagActivitie = false;

  constructor() {
    this.mediaQuery();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.sendActionSidenav.unsubscribe();
    this.valCardSubjectEmitt.unsubscribe();
    this.sendActEraseLocalStor.unsubscribe();
    this.destroyed.next();
    this.destroyed.unsubscribe();
  }

  /**
   * Ejecuta un scroll suave hacia el contenedor objetivo de las secretarías
   * @param target Elemento HTML referenciado en la vista
   */
  public scrollToTarget(target: HTMLElement): void {
    target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  }

  actionOnSidenav(val: boolean): void {
    this.sendActionSidenav.next(val);
    return;
  }

  activeOrInactiveToolbarMenu(val: boolean){
    this.flagActivitie = val;
  }

  triggerAlert(event: string) {
    this.openSnackBar(event);
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message, duration: 5500, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
    });
  }

  reciveValCard(valCard: MenuConceptos[]) {
    this.valCardSubjectEmitt.next(valCard);
    this.senNameDep = valCard[0].titulo;
  }

  reciveNameConcept(nameConcep: string) {
    this.receiveNameConcept = ' - [ ' + nameConcep + ' ]';
    this.controlView = true;
  }

  redirectHome(event: boolean): void {
    this.controlView = false;
    this.senNameDep = 'SECRETARÍA DE ADMINISTRACIÓN Y FINANZAS';
    this.receiveNameConcept = '';
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