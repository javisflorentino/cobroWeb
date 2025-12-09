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
import { PagoRevistaMecanicaComponent } from './pago-revista-mecanica/pago-revista-mecanica.component';
import { AltaVehiculoSinRegistroComponent } from './alta-vehiculo-sin-registro/alta-vehiculo-sin-registro.component';
import { CambioPropietarioComponent } from './cambio-propietario/cambio-propietario.component';
import { CambioPropietarioBajaComponent } from './cambio-propietario-baja/cambio-propietario-baja.component';
import { AltaVehiculoCambioPropietarioComponent } from './alta-vehiculo-cambio-propietario/alta-vehiculo-cambio-propietario.component';
import { RefrendoCambioPropietarioComponent } from './refrendo-cambio-propietario/refrendo-cambio-propietario.component';
import { SustitucionPlacaCambioPropietarioComponent } from './sustitucion-placa-cambio-propietario/sustitucion-placa-cambio-propietario.component';
import { PagoRefrendoServicioPublicoComponent } from './pago-refrendo-servicio-publico/pago-refrendo-servicio-publico.component';
import { CesionDerechosComponent } from '../cesion-derechos/cesion-derechos/cesion-derechos.component';

const routes: Routes = [
  {
    path: 'smyt-refrendo/:idConcepto/:tipoForm',
    component: PagoRefrendoPageComponent
  },
  {
    path: 'smyt-altavehiculo-nuevo/:idConcepto/:tipoForm',
    component: AltaVehiculoNuevoPageComponent
  },

  /* TODO: 24/06/2025 Carlos A.  Se agregaron las siguientes seis rutas*/
  {
    path: 'alta-vehiculo-sin_registro/:idConcepto/:formulario',
    component: AltaVehiculoSinRegistroComponent
  },
  {
    path: 'sustitucion-placa-cambio-propietario/:idConcepto/:formulario',
    component: SustitucionPlacaCambioPropietarioComponent
  },
  {
    path: 'cambio-propietario/:idConcepto/:formulario',
    component: CambioPropietarioComponent
  },
  {
    path: 'cambio-propietario-baja/:idConcepto/:formulario',
    component: CambioPropietarioBajaComponent
  },
  {
    path: 'alta-vehiculo-cambio-propietario/:idConcepto/:formulario',
    component: AltaVehiculoCambioPropietarioComponent
  },
  {
    path: 'refrendo-cambio-propietario/:idConcepto/:formulario',
    component: RefrendoCambioPropietarioComponent
  },


  {
    path: 'smyt-altavehiculo-usado/:idConcepto/:tipoForm',
    component: AltaVehiculoUsadoPageComponent
  },
  {
    path: 'smyt-baja/:idConcepto/:tipoForm',
    component: BajaVehiculoComponent
  },
  {
    path: 'smyt-tarjeta-duplicada/:idConcepto/:tipoForm',
    component: TarjetaDuplicadaVehiculoComponent
  },
  {
    path: 'smyt-sustitucion-placa/:idConcepto/:tipoForm',
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
    path: 'smyt-revista-mecanica/:idConcepto/:tipoForm',
    component: PagoRevistaMecanicaComponent
  },
  /* TODO: Carlos A 17/07/2025  Nueva ruta Refrendo Anual Servicio Publico*/
  {
    path: 'smyt-refrendo-serv-pub/:idConcepto/:tipoForm',
    component: PagoRefrendoServicioPublicoComponent
  },
  {
    path: 'smyt-cesion-derechos/:idConcepto/:tipoForm',
    component: CesionDerechosComponent
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
