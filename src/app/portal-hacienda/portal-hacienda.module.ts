import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortalHaciendaRoutingModule } from './portal-hacienda-routing.module';
import { LayoutPortalPagosComponent } from './pages/layout-portal-pagos.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { MenuImagePipe } from './pipes/menu-image.pipe';
import { CardsDependenciasComponent } from './components/cards-dependencias/cards-dependencias.component';



@NgModule({
  declarations: [
    LayoutPortalPagosComponent,
    CardsDependenciasComponent,
    MenuImagePipe
  ],
  imports: [
    CommonModule,
    MaterialModule,
    PortalHaciendaRoutingModule,
    SharedModule
  ]
})
export class PortalHaciendaModule { }
