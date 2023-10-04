import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { MenuService } from '../../services/menu.service';
import { Conceptos } from '../../interfaces/shared-conceptos.interface';
import { Router } from '@angular/router';


@Component({
  selector: 'shared-sidenav-conceptos',
  templateUrl: './sidenav-conceptos.component.html',
  styles: [
  ]
})
export class SidenavConceptosComponent implements OnInit, OnChanges {


  @Input()
  public reciveActionSideNav!:number;

  @Input()
  public eraseLocalStor: boolean = false;

  // Envia el valor al padre layout-portal-pagos
  @Output()
  private nameConcept = new EventEmitter<string>();


  @ViewChild('sidenav')
  public changSidenav!: MatSidenav;

  public itemsConceptos: Conceptos[] = [];

  constructor( private menuService: MenuService, private router: Router ) {}

  ngOnChanges(changes: SimpleChanges): void {

    if(this.changSidenav) {
      this.changSidenav.toggle();
      if ( this.eraseLocalStor ) {
        localStorage.clear();
        this.itemsConceptos = [];
        this.eraseLocalStor = false;
        this.router.navigate(['/pagos']);
        return;
      }
      this.buildMenu();
    }
  }
  ngOnInit(): void { }

  buildMenu() {
    if ( this.menuService.conceptoStorage.length > 0 ) {
      this.itemsConceptos = this.menuService.conceptoStorage;
      return ;
    }
    this.menuService.requestConceptos(this.reciveActionSideNav)
      .subscribe(conceptos => this.itemsConceptos = conceptos)
  }

  destroyLocalStorAndArray() {
    localStorage.clear();
    this.itemsConceptos=[];
  }

  actionList(item: string, concept: string) {
    this.nameConcept.emit(concept);
    this.changSidenav.toggle();
    localStorage.setItem('concept',concept);
    this.router.navigate(['/pagos/'+item]);
  }

}


