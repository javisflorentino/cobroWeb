import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { MenuService } from '../../services/menu.service';
import { Conceptos } from '../../interfaces/shared-conceptos.interface';


@Component({
  selector: 'shared-sidenav-conceptos',
  templateUrl: './sidenav-conceptos.component.html',
  styles: [
  ]
})
export class SidenavConceptosComponent implements OnInit, OnChanges {


  @Input()
  public reciveActionSideNav!:number;

  @ViewChild('sidenav')
  public changSidenav!: MatSidenav;

  public itemsConceptos: Conceptos[] = [];

  constructor( private menuService: MenuService ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(this.changSidenav) {
      this.changSidenav.toggle();
      this.buildMenu();
    }
  }
  ngOnInit(): void {
    console.log();
  }

  buildMenu() {
    this.menuService.requestConceptos(this.reciveActionSideNav)
      .subscribe(conceptos => this.itemsConceptos = conceptos)
  }

}


