import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HaciendaRoutingModule } from './hacienda-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material/material.module';
import { ImpuestosPagesComponent } from './pages/impuestos-pages/impuestos-pages.component';
import { ImpuestosComponent } from './components/impuestos/impuestos.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ImpuestosComponent,
    ImpuestosPagesComponent
  ],
  imports: [
    CommonModule,
    HaciendaRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ]
})
export class HaciendaModule { }
