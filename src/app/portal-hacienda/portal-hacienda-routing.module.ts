import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPortalPagosComponent } from './pages/layout-portal-pagos.component';
import { CardsDependenciasComponent } from './components/cards-dependencias/cards-dependencias.component';
import { DatosContribuyenteComponent } from '../shared/components/datos-contribuyente/datos-contribuyente.component';
import { SharedDatosPolizaComponent } from '../shared/components/shared-datos-poliza/shared-datos-poliza.component';
import { TablaCalculoConceptosComponent } from '../shared/components/tabla-calculo-conceptos/tabla-calculo-conceptos.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPortalPagosComponent,
    children: [
      /*{
        path: 'dependencias',
        component: CardsDependenciasComponent
      },*/
      {
        path:'datos-contribuyente',
        component:DatosContribuyenteComponent
      },
      {
        path: 'generar_poliza',
        component: SharedDatosPolizaComponent
      },
      {
        path: 'tabla-conceptos/:idConcepto',
        component: TablaCalculoConceptosComponent
      },
      {
        path: 'tabla-conceptos/:idConcepto/:tipoForm',
        component: TablaCalculoConceptosComponent
      },
      {
        path: 'smyt',
        loadChildren: () => import('./pages/smyt/smyt.module').then(m => m.SmytModule)
      },
      {
        path: 'hacienda',
        loadChildren: () => import('./hacienda/hacienda.module').then(m => m.HaciendaModule)
      },
      {
        path: 'desarrollo-sustentable',
        loadChildren: () => import('./desarrollo-sustentable/desarrollo-sustentable.module').then(m => m.DesarrolloSustentableModule)
      },
      {
        path: '**',
        redirectTo: 'dependencias'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalHaciendaRoutingModule { }
