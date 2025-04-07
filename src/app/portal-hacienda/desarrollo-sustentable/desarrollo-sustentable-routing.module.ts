import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TablaCalculoConceptosComponent } from 'src/app/shared/components/tabla-calculo-conceptos/tabla-calculo-conceptos.component';
import { CertificacionVehicularPageComponent } from './pages/certificacion-vehicular-page/certificacion-vehicular-page.component';
import { MultaVerificacionPageComponent } from './pages/multa-verificacion-page/multa-verificacion-page.component';
import { CopiaCertificadaVerificacionPageComponent } from './pages/copia-certificada-verificacion-page/copia-certificada-verificacion-page.component';

const routes: Routes = [
  {
    path: 'admision-parque-chapultepec/:idConcepto/:tipoForm',
    component: TablaCalculoConceptosComponent
  },
  {
    path: 'atraccion-parque-chapultepec/:idConcepto/:tipoForm',
    component: TablaCalculoConceptosComponent
  },
  {
    path: 'atraccion-con-parque-chapultepec/:idConcepto/:tipoForm',
    component: TablaCalculoConceptosComponent
  },
  {
    path: 'otrosserv-parque-chapultepec/:idConcepto/:tipoForm',
    component: TablaCalculoConceptosComponent
  },
  {
    path: 'calidad-aire/:idConcepto/:tipoForm',
    component: TablaCalculoConceptosComponent
  },
  {
    path: 'calidad-aire-certificacionver/:idConcepto/:tipoForm',
    component: CertificacionVehicularPageComponent
  },
  {
    path: 'calidad-aire-copiacertifverif/:idConcepto/:tipoForm',
    component: CopiaCertificadaVerificacionPageComponent
  },
  {
    path: 'calidad-aire-multaverif/:idConcepto/:tipoForm',
    component: MultaVerificacionPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DesarrolloSustentableRoutingModule { }
