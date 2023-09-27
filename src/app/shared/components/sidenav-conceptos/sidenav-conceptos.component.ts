import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';


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

  ngOnChanges(changes: SimpleChanges): void {
    if(this.changSidenav)
      this.changSidenav.toggle()
  }
  ngOnInit(): void {
    console.log();
  }

}


