import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortalHaciendaRoutingModule } from './portal-hacienda-routing.module';
import { LayoutPortalPagosComponent } from './pages/layout-portal-pagos.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { MenuImagePipe } from './pipes/menu-image.pipe';
import { CardsDependenciasComponent } from './components/cards-dependencias/cards-dependencias.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HistoricoPagosComponent } from './components/historico-pagos/historico-pagos.component';


@NgModule({
  declarations: [
    LayoutPortalPagosComponent,
    CardsDependenciasComponent,
    MenuImagePipe,
    HistoricoPagosComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    PortalHaciendaRoutingModule,
    SharedModule,
    MatTooltipModule
  ]
})
export class PortalHaciendaModule { }
