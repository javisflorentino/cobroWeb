import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusquedaEstadoCuentaComponent } from './busqueda-estado-cuenta/busqueda-estado-cuenta.component';
import { RouterModule, Routes } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material/material.module';


const routes: Routes = [
  {
    path: 'buscar-estado-cuenta',
    component: BusquedaEstadoCuentaComponent
  },
  {
    path: 'buscar-estado-cuenta/:idConcepto/:tipoForm',
    component: BusquedaEstadoCuentaComponent
  },
  {
    path: '**',
    redirectTo: 'buscar-estado-cuenta'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PredialMunicipalRoutingModule {

 }
