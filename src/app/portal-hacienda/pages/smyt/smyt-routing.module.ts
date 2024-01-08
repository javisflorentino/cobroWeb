import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagoRefrendoPageComponent } from './pago-refrendo-page/pago-refrendo-page.component';
import { AltaVehiculoNuevoPageComponent } from './alta-vehiculo-nuevo-page/alta-vehiculo-nuevo-page.component';
import { AltaVehiculoUsadoPageComponent } from './alta-vehiculo-usado-page/alta-vehiculo-usado-page.component';
import { BajaVehiculoComponent } from './baja-vehiculo/baja-vehiculo.component';
import { TarjetaDuplicadaVehiculoComponent } from './tarjeta-duplicada-vehiculo/tarjeta-duplicada-vehiculo.component';
import { SustitucionPlacaVehiculoComponent } from './sustitucion-placa-vehiculo/sustitucion-placa-vehiculo.component';
import { TablaCalculoConceptosComponent } from 'src/app/shared/components/tabla-calculo-conceptos/tabla-calculo-conceptos.component';
import { LicenciaVehiculoComponent } from './licencia-vehiculo/licencia-vehiculo.component';

const routes: Routes = [
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
    path: 'smyt-permisos/:idConcepto/:tipoForm',
    component: TablaCalculoConceptosComponent//ArrastreOtrosVehiculoComponent
  },
  {
    path: 'smyt-licencia-vehiculo/:idConcepto/:tipoForm',
    component: LicenciaVehiculoComponent
  },
  {
    path: 'portalhacienda-proteccion-civil/:idConcepto/:tipoForm',
    component: TablaCalculoConceptosComponent
  },
  {
    path: '**',
    redirectTo: 'pagos'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmytRoutingModule { }
