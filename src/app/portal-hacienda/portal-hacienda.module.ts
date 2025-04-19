import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortalHaciendaRoutingModule } from './portal-hacienda-routing.module';
import { LayoutPortalPagosComponent } from './pages/layout-portal-pagos.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { MenuImagePipe } from './pipes/menu-image.pipe';
import { CardsDependenciasComponent } from './components/cards-dependencias/cards-dependencias.component';
import { NotariosComponent } from './pages/ser-catastrales/notarios/notarios.component';
import { ImpuestosComponent } from './pages/hacienda-impuestos/impuestos/impuestos.component';
import { PublicoGeneralComponent } from './pages/ser-catastrales/publico-general/publico-general.component';


@NgModule({
  declarations: [
    LayoutPortalPagosComponent,
    CardsDependenciasComponent,
    MenuImagePipe,
    NotariosComponent,
    ImpuestosComponent,
    PublicoGeneralComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    PortalHaciendaRoutingModule,
    SharedModule
  ]
})
export class PortalHaciendaModule { }
