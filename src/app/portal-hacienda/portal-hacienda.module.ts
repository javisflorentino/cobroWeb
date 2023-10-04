import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortalHaciendaRoutingModule } from './portal-hacienda-routing.module';
import { LayoutPortalPagosComponent } from './pages/layout-portal-pagos.component';
import { CardsDependenciasComponent } from './pages/cards-dependencias/cards-dependencias.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { MenuImagePipe } from './pipes/menu-image.pipe';
import { PagoRefrendoPageComponent } from './pages/smyt/pago-refrendo-page/pago-refrendo-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormAltaVehiculoComponent } from './components/smyt/form-alta-vehiculo/form-alta-vehiculo.component';
import { AltaVehiculoNuevoPageComponent } from './pages/smyt/alta-vehiculo-nuevo-page/alta-vehiculo-nuevo-page.component';
import { MessagesComponent } from './components/smyt/messages/messages.component';


@NgModule({
  declarations: [
    LayoutPortalPagosComponent,
    CardsDependenciasComponent,
    MenuImagePipe,
    PagoRefrendoPageComponent,
    FormAltaVehiculoComponent,
    AltaVehiculoNuevoPageComponent,
    MessagesComponent
  ],
  imports: [
    CommonModule,
    PortalHaciendaRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class PortalHaciendaModule { }
