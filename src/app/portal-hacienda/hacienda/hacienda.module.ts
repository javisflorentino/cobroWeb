import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HaciendaRoutingModule } from './hacienda-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material/material.module';
import { ImpuestosPagesComponent } from './pages/impuestos-pages/impuestos-pages.component';
import { ImpuestosComponent } from './components/impuestos/impuestos.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { IsanPagesComponent } from './pages/isan-pages/isan-pages.component';
import { ReintegrosPagesComponent } from './pages/reintegros-pages/reintegros-pages.component';
import { MessagesHaciendaComponent } from '../components/hacienda/messages-hacienda/messages-hacienda.component';
import { EnajenacionBienesPagesComponent } from './pages/enajenacion-bienes-pages/enajenacion-bienes-pages.component';
import { ImpuestoCedularEnajenacionBienesComponent } from './pages/impuesto-cedular-enajenacion-bienes/impuesto-cedular-enajenacion-bienes.component';
import { CincoMillarComponent } from './pages/cinco-millar/cinco-millar.component';
import { YearPickerComponent } from './components/year-picker/year-picker.component';

@NgModule({
  declarations: [
    ImpuestosComponent,
    ImpuestosPagesComponent,
    IsanPagesComponent,
    ReintegrosPagesComponent,
    MessagesHaciendaComponent,
    EnajenacionBienesPagesComponent,
    ImpuestoCedularEnajenacionBienesComponent,
    CincoMillarComponent,
    YearPickerComponent
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
