import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortalHaciendaRoutingModule } from './portal-hacienda-routing.module';
import { LayoutPortalPagosComponent } from './pages/layout-portal-pagos.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { MenuImagePipe } from './pipes/menu-image.pipe';
import { CardsDependenciasComponent } from './components/cards-dependencias/cards-dependencias.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HistoricoPagosComponent } from './components/historico-pagos/historico-pagos.component';

import { NotariosComponent } from './pages/ser-catastrales/notarios/notarios.component';
import { PublicoGeneralComponent } from './pages/ser-catastrales/publico-general/publico-general.component';
import { ImpuestosComponent } from './pages/hacienda-impuestos/impuestos/impuestos.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CesionDerechosComponent } from './pages/cesion-derechos/cesion-derechos/cesion-derechos.component';
//import { DataVehicleComponent } from './components/smyt/data-vehicle/data-vehicle.component';
import { CardsPasarelaPagosComponent } from './components/cards-pasarela-pagos/cards-pasarela-pagos.component';
import { MenuImageSharedPipe } from './pipes/menu-image-shared.pipe';
import { PasarelaEvoPayComponent } from './components/pasarela-evo-pay/pasarela-evo-pay.component';
import { ThreeDSecureModalComponent } from './components/three-dsecure-modal/three-dsecure-modal.component';
import { PasarelaBanbajioPaymentComponent } from './components/pasarela-banbajio-payment/pasarela-banbajio-payment.component';
import { PasarelaSantanderPaymentComponent } from './components/pasarela-santander-payment/pasarela-santander-payment.component';

@NgModule({
  declarations: [
    LayoutPortalPagosComponent,
    CardsDependenciasComponent,
    MenuImagePipe,
    HistoricoPagosComponent,

    NotariosComponent,
    PublicoGeneralComponent,
    ImpuestosComponent,
    CesionDerechosComponent,
    CardsPasarelaPagosComponent,
    MenuImageSharedPipe,
    PasarelaEvoPayComponent,
    ThreeDSecureModalComponent,
    PasarelaBanbajioPaymentComponent,
    PasarelaSantanderPaymentComponent
    //DataVehicleComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    PortalHaciendaRoutingModule,
    SharedModule,
    MatTooltipModule,
    ReactiveFormsModule
  ]
})
export class PortalHaciendaModule { }
