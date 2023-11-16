import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImpuestosPagesComponent } from './pages/impuestos-pages/impuestos-pages.component';

const routes: Routes = [
  {
    path: 'hacienda-impuestos/:idConcepto/:tipoForm',
    component: ImpuestosPagesComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HaciendaRoutingModule { }
