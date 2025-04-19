import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavConceptosComponent } from './components/sidenav-conceptos/sidenav-conceptos.component';
import { Error404PageComponent } from './pages/error404-page/error404-page.component';
import { MaterialModule } from '../material/material.module';
import { SharedToolbarComponent } from './components/shared-toolbar/shared-toolbar.component';
import { RouterModule } from '@angular/router';
import { TablaCalculoConceptosComponent } from './components/tabla-calculo-conceptos/tabla-calculo-conceptos.component';
import { DatosContribuyenteComponent } from './components/datos-contribuyente/datos-contribuyente.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedDatosPolizaComponent } from './components/shared-datos-poliza/shared-datos-poliza.component';
import { LoadSpinnerComponent } from './components/load-spinner/load-spinner.component';
import { SegmentTextPipe } from './pipes/segment-text.pipe';
import { SnackBarComponent } from './components/snack-bar/snack-bar.component'

import {MatMenuModule} from '@angular/material/menu';
import { SanitizeUrlPipe } from './pipes/sanitize-url.pipe';
import { ModalPagoLineaComponent } from './components/modal-pago-linea/modal-pago-linea.component';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalComprobantePagoComponent } from './components/modal-comprobante-pago/modal-comprobante-pago.component';
import { ModalHistoricoPagosComponent } from './components/modal-historico-pagos/modal-historico-pagos.component';
import { ModalFacturacionComponent } from './components/modal-facturacion/modal-facturacion.component';


@NgModule({
  declarations: [
    SidenavConceptosComponent,
    Error404PageComponent,
    SharedToolbarComponent,
    TablaCalculoConceptosComponent,
    DatosContribuyenteComponent,
    SharedDatosPolizaComponent,
    LoadSpinnerComponent,
    SegmentTextPipe,
    SnackBarComponent,
    SanitizeUrlPipe,
    ModalPagoLineaComponent,
    ModalComprobantePagoComponent,
    ModalHistoricoPagosComponent,
    ModalFacturacionComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    MatMenuModule
  ],
  exports: [
    SidenavConceptosComponent,
    SharedToolbarComponent,
    TablaCalculoConceptosComponent,
    LoadSpinnerComponent,
    SegmentTextPipe,
    SnackBarComponent
  ]
})
export class SharedModule { }
