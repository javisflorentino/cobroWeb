import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPortalPagosComponent } from './pages/layout-portal-pagos.component';
import { CardsDependenciasComponent } from './pages/cards-dependencias/cards-dependencias.component';
import { PagoRefrendoPageComponent } from './pages/smyt/pago-refrendo-page/pago-refrendo-page.component';
import { AltaVehiculoNuevoPageComponent } from './pages/smyt/alta-vehiculo-nuevo-page/alta-vehiculo-nuevo-page.component';
import { AltaVehiculoUsadoPageComponent } from './pages/smyt/alta-vehiculo-usado-page/alta-vehiculo-usado-page.component';
import { TablaCalculoConceptosComponent } from '../shared/components/tabla-calculo-conceptos/tabla-calculo-conceptos.component';
import { DatosContribuyenteComponent } from '../shared/components/datos-contribuyente/datos-contribuyente.component';
import { SharedDatosPolizaComponent } from '../shared/components/shared-datos-poliza/shared-datos-poliza.component';
import { LicenciaVehiculoComponent } from './pages/smyt/licencia-vehiculo/licencia-vehiculo.component';
import { ProteccionCivilComponent } from './pages/proteccion-civil/proteccion-civil/proteccion-civil.component';
import { BajaVehiculoComponent } from './pages/smyt/baja-vehiculo/baja-vehiculo.component';
import { TarjetaDuplicadaVehiculoComponent } from './pages/smyt/tarjeta-duplicada-vehiculo/tarjeta-duplicada-vehiculo.component';
import { SustitucionPlacaVehiculoComponent } from './pages/smyt/sustitucion-placa-vehiculo/sustitucion-placa-vehiculo.component';

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
        path: 'smyt-baja',
        component: BajaVehiculoComponent
      },
      {
        path: 'smyt-tarjeta-duplicada',
        component: TarjetaDuplicadaVehiculoComponent
      },
      {
        path: 'smyt-sustitucion-placa',
        component: SustitucionPlacaVehiculoComponent
      },
      {
        path: 'smyt-arrastre-otros/:idConcepto/:tipoForm',
        component: TablaCalculoConceptosComponent//ArrastreOtrosVehiculoComponent
      },
      {
        path: 'tabla-conceptos/:idConcepto',
        component: TablaCalculoConceptosComponent
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
        path: 'smyt-licencia-vehiculo',
        component: LicenciaVehiculoComponent
      },
      {
        path: 'portalhacienda-proteccion-civil/:idConcepto/:tipoForm',
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
