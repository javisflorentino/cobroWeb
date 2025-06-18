import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusquedaEstadoCuentaComponent } from './busqueda-estado-cuenta/busqueda-estado-cuenta.component';
import { PredialMunicipalRoutingModule } from './predial-municipal-routing.module';
import { MaterialModule } from 'src/app/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    BusquedaEstadoCuentaComponent
    

  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    MatTooltipModule,
    ReactiveFormsModule,
    PredialMunicipalRoutingModule
  ]
})
export class PredialMunicipalModule { }
