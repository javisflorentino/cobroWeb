import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavConceptosComponent } from './components/sidenav-conceptos/sidenav-conceptos.component';
import { Error404PageComponent } from './pages/error404-page/error404-page.component';
import { MaterialModule } from '../material/material.module';
import { SharedToolbarComponent } from './components/shared-toolbar/shared-toolbar.component';
import { RouterModule } from '@angular/router';
import { TablaCalculoConceptosComponent } from './components/tabla-calculo-conceptos/tabla-calculo-conceptos.component';



@NgModule({
  declarations: [
    SidenavConceptosComponent,
    Error404PageComponent,
    SharedToolbarComponent,
    TablaCalculoConceptosComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ],
  exports: [
    SidenavConceptosComponent,
    SharedToolbarComponent,
    TablaCalculoConceptosComponent
  ]
})
export class SharedModule { }
