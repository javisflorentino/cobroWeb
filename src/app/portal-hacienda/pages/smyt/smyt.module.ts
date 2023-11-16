import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SmytRoutingModule } from './smyt-routing.module';

import { MaterialModule } from '../../../material/material.module';
import { PagoRefrendoPageComponent } from './pago-refrendo-page/pago-refrendo-page.component';//'./pages/smyt/pago-refrendo-page/pago-refrendo-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormAltaVehiculoComponent } from '../../components/smyt/form-alta-vehiculo/form-alta-vehiculo.component';
import { AltaVehiculoNuevoPageComponent } from './alta-vehiculo-nuevo-page/alta-vehiculo-nuevo-page.component';
import { MessagesComponent } from '../../components/smyt/messages/messages.component';
import { AltaVehiculoUsadoPageComponent } from './alta-vehiculo-usado-page/alta-vehiculo-usado-page.component';
import { LicenciaVehiculoComponent } from './licencia-vehiculo/licencia-vehiculo.component';
import { BajaVehiculoComponent } from './baja-vehiculo/baja-vehiculo.component';
import { TarjetaDuplicadaVehiculoComponent } from './tarjeta-duplicada-vehiculo/tarjeta-duplicada-vehiculo.component';
import { SustitucionPlacaVehiculoComponent } from './sustitucion-placa-vehiculo/sustitucion-placa-vehiculo.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    PagoRefrendoPageComponent,
    FormAltaVehiculoComponent,
    AltaVehiculoNuevoPageComponent,
    MessagesComponent,
    AltaVehiculoUsadoPageComponent,
    LicenciaVehiculoComponent,
    BajaVehiculoComponent,
    TarjetaDuplicadaVehiculoComponent,
    SustitucionPlacaVehiculoComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    SmytRoutingModule,
    SharedModule
  ]
})
export class SmytModule { }
