import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavConceptosComponent } from './components/sidenav-conceptos/sidenav-conceptos.component';
import { Error404PageComponent } from './pages/error404-page/error404-page.component';
import { MaterialModule } from '../material/material.module';
import { SharedToolbarComponent } from './components/shared-toolbar/shared-toolbar.component';
import { RouterModule } from '@angular/router';
import { TablaCalculoConceptosComponent } from './components/tabla-calculo-conceptos/tabla-calculo-conceptos.component';
import { DatosContribuyenteComponent } from './components/datos-contribuyente/datos-contribuyente.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedDatosPolizaComponent } from './components/shared-datos-poliza/shared-datos-poliza.component';
import { LoadSpinnerComponent } from './components/load-spinner/load-spinner.component';




@NgModule({
  declarations: [
    SidenavConceptosComponent,
    Error404PageComponent,
    SharedToolbarComponent,
    TablaCalculoConceptosComponent,
    DatosContribuyenteComponent,
    SharedDatosPolizaComponent,
    LoadSpinnerComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    SidenavConceptosComponent,
    SharedToolbarComponent,
    TablaCalculoConceptosComponent,
    LoadSpinnerComponent
  ]
})
export class SharedModule { }
