import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DesarrolloSustentableRoutingModule } from './desarrollo-sustentable-routing.module';
import { CertificacionVehicularPageComponent } from './pages/certificacion-vehicular-page/certificacion-vehicular-page.component';
import { MultaVerificacionPageComponent } from './pages/multa-verificacion-page/multa-verificacion-page.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CopiaCertificadaVerificacionPageComponent } from './pages/copia-certificada-verificacion-page/copia-certificada-verificacion-page.component';


@NgModule({
  declarations: [
    CertificacionVehicularPageComponent,
    MultaVerificacionPageComponent,
    CopiaCertificadaVerificacionPageComponent
  ],
  imports: [
    CommonModule,
    DesarrolloSustentableRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class DesarrolloSustentableModule { }
