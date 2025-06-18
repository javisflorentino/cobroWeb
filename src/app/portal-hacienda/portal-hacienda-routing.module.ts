import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPortalPagosComponent } from './pages/layout-portal-pagos.component';
import { CardsDependenciasComponent } from './components/cards-dependencias/cards-dependencias.component';
import { DatosContribuyenteComponent } from '../shared/components/datos-contribuyente/datos-contribuyente.component';
import { SharedDatosPolizaComponent } from '../shared/components/shared-datos-poliza/shared-datos-poliza.component';
import { TablaCalculoConceptosComponent } from '../shared/components/tabla-calculo-conceptos/tabla-calculo-conceptos.component';
import { HistoricoPagosComponent } from './components/historico-pagos/historico-pagos.component';
import { NotariosComponent } from './pages/ser-catastrales/notarios/notarios.component';
import { ImpuestosComponent } from './pages/hacienda-impuestos/impuestos/impuestos.component';
import { PublicoGeneralComponent } from './pages/ser-catastrales/publico-general/publico-general.component';
import { ImpuestosPagesComponent } from './hacienda/pages/impuestos-pages/impuestos-pages.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPortalPagosComponent,
    children: [
      {
        path: 'dependencias',
        component: CardsDependenciasComponent
      },
      {
        path: 'dependencias/:flag',
        component: CardsDependenciasComponent
      },
     
      {
        path:'datos-contribuyente',
        component:DatosContribuyenteComponent
      },
      {
        path: 'generar_poliza',
        component: SharedDatosPolizaComponent
      },
      {
        path: 'historico-pagos',
        component: HistoricoPagosComponent
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
        path: 'registropublico/:idConcepto/:tipoForm',
        component: NotariosComponent
      },
      {
        path: 'impuestos/:idConcepto/:tipoForm',
        component: ImpuestosComponent
      },
      {
        path: 'publicogeneral/:idConcepto/:tipoForm',
        component: PublicoGeneralComponent
      },
      {
        path: 'smyt',
        loadChildren: () => import('./pages/smyt/smyt.module').then(m => m.SmytModule)
      },
      {
        path: 'predial-municipal',
        loadChildren: () => import('./pages/predial-municipal/predial-municipal.module').then(m => m.PredialMunicipalModule)
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
        redirectTo: 'pagos/dependencias'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalHaciendaRoutingModule { }
