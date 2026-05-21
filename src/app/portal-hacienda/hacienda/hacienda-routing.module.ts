import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImpuestosPagesComponent } from './pages/impuestos-pages/impuestos-pages.component';
import { IsanPagesComponent } from './pages/isan-pages/isan-pages.component';
import { ReintegrosPagesComponent } from './pages/reintegros-pages/reintegros-pages.component';
import { EnajenacionBienesPagesComponent } from './pages/enajenacion-bienes-pages/enajenacion-bienes-pages.component';
import { ImpuestoCedularEnajenacionBienesComponent } from './pages/impuesto-cedular-enajenacion-bienes/impuesto-cedular-enajenacion-bienes.component';
import { CincoMillarComponent } from './pages/cinco-millar/cinco-millar.component';


const routes: Routes = [
  {
    path: 'hacienda-impuestos/:idConcepto/:tipoForm',
    component: ImpuestosPagesComponent,
  },
  {
    path: 'hacienda-isan/:idConcepto/:tipoForm',
    component: IsanPagesComponent,
  },
  {
    path: 'hacienda-reintegros/:idConcept/:tipoForm',
    component: ReintegrosPagesComponent
  },
  {
    path: 'hacienda-enajenacion/:idConcept/:tipoForm',
    component: EnajenacionBienesPagesComponent
  },
  /* 02/01/2025 */
  {
    path: 'hacienda-impuesto-cedular/:idConcept/:tipoForm',
    component: ImpuestoCedularEnajenacionBienesComponent
  },
  {
    path: 'hacienda-cinco-millar/:idConcept/:tipoForm',
    component: CincoMillarComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HaciendaRoutingModule { }
