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
import { PagoRevistaMecanicaComponent } from './pago-revista-mecanica/pago-revista-mecanica.component';

/* TODO: 24/06/2025 Carlos A.  Se generaron las siguientes siete controllers*/
import { AltaVehiculoSinRegistroComponent } from './alta-vehiculo-sin-registro/alta-vehiculo-sin-registro.component';
import { DataVehicleComponent } from 'src/app/portal-hacienda/components/smyt/data-vehicle/data-vehicle.component';
import { SustitucionPlacaCambioPropietarioComponent } from './sustitucion-placa-cambio-propietario/sustitucion-placa-cambio-propietario.component';
import { CambioPropietarioComponent } from './cambio-propietario/cambio-propietario.component';
import { CambioPropietarioBajaComponent } from './cambio-propietario-baja/cambio-propietario-baja.component';
import { AltaVehiculoCambioPropietarioComponent } from './alta-vehiculo-cambio-propietario/alta-vehiculo-cambio-propietario.component';
import { RefrendoCambioPropietarioComponent } from './refrendo-cambio-propietario/refrendo-cambio-propietario.component';



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
    SustitucionPlacaVehiculoComponent,
    PagoRevistaMecanicaComponent,
    AltaVehiculoSinRegistroComponent,
    DataVehicleComponent,
    SustitucionPlacaCambioPropietarioComponent,
    CambioPropietarioComponent,
    CambioPropietarioBajaComponent,
    AltaVehiculoCambioPropietarioComponent,
    RefrendoCambioPropietarioComponent
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
