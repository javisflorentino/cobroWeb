import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortalHaciendaRoutingModule } from './portal-hacienda-routing.module';
import { LayoutPortalPagosComponent } from './pages/layout-portal-pagos.component';
import { CardsDependenciasComponent } from './pages/cards-dependencias/cards-dependencias.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { MenuImagePipe } from './pipes/menu-image.pipe';
import { PagoRefrendoPageComponent } from './pages/smyt/pago-refrendo-page/pago-refrendo-page.component';//'./pages/smyt/pago-refrendo-page/pago-refrendo-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormAltaVehiculoComponent } from './components/smyt/form-alta-vehiculo/form-alta-vehiculo.component';
import { AltaVehiculoNuevoPageComponent } from './pages/smyt/alta-vehiculo-nuevo-page/alta-vehiculo-nuevo-page.component';
import { MessagesComponent } from './components/smyt/messages/messages.component';
import { AltaVehiculoUsadoPageComponent } from './pages/smyt/alta-vehiculo-usado-page/alta-vehiculo-usado-page.component';
import { LicenciaVehiculoComponent } from './pages/smyt/licencia-vehiculo/licencia-vehiculo.component';
import { ProteccionCivilComponent } from './pages/proteccion-civil/proteccion-civil/proteccion-civil.component';
import { BajaVehiculoComponent } from './pages/smyt/baja-vehiculo/baja-vehiculo.component';
import { TarjetaDuplicadaVehiculoComponent } from './pages/smyt/tarjeta-duplicada-vehiculo/tarjeta-duplicada-vehiculo.component';
import { SustitucionPlacaVehiculoComponent } from './pages/smyt/sustitucion-placa-vehiculo/sustitucion-placa-vehiculo.component';


@NgModule({
  declarations: [
    LayoutPortalPagosComponent,
    CardsDependenciasComponent,
    MenuImagePipe,
    PagoRefrendoPageComponent,
    FormAltaVehiculoComponent,
    AltaVehiculoNuevoPageComponent,
    MessagesComponent,
    AltaVehiculoUsadoPageComponent,
    LicenciaVehiculoComponent,
    ProteccionCivilComponent,
    BajaVehiculoComponent,
    TarjetaDuplicadaVehiculoComponent,
    SustitucionPlacaVehiculoComponent
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
