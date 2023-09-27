import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPortalPagosComponent } from './pages/layout-portal-pagos.component';
import { CardsDependenciasComponent } from './pages/cards-dependencias/cards-dependencias.component';
import { PagoRefrendoPageComponent } from './pages/smyt/pago-refrendo-page/pago-refrendo-page.component';

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
