import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPortalPagosComponent } from './pages/layout-portal-pagos.component';
import { CardsDependenciasComponent } from './pages/cards-dependencias/cards-dependencias.component';
import { PagoRefrendoPageComponent } from './pages/smyt/pago-refrendo-page/pago-refrendo-page.component';
import { AltaVehiculoNuevoPageComponent } from './pages/smyt/alta-vehiculo-nuevo-page/alta-vehiculo-nuevo-page.component';
import { AltaVehiculoUsadoPageComponent } from './pages/smyt/alta-vehiculo-usado-page/alta-vehiculo-usado-page.component';
import { TablaCalculoConceptosComponent } from '../shared/components/tabla-calculo-conceptos/tabla-calculo-conceptos.component';

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
        path: 'smyt-refrendo',
        component: PagoRefrendoPageComponent
      },
      {
        path: 'smyt-altavehiculo-nuevo',
        component: AltaVehiculoNuevoPageComponent
      },
      {
        path: 'smyt-altavehiculo-usado',
        component: AltaVehiculoUsadoPageComponent
      },
      {
        path: 'tabla-conceptos',
        component: TablaCalculoConceptosComponent
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
