import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
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
import { ModalValidarReciboOficioComponent } from './components/modal-validar-recibo-oficio/modal-validar-recibo-oficio.component';
import { ModalOficioHabilitacionComponent } from './components/modal-oficio-habilitacion/modal-oficio-habilitacion.component';
import { SharedToolbarMenuComponent } from './components/shared-toolbar-menu/shared-toolbar-menu.component';
import { PdfViewerComponentComponent } from './components/pdf-viewer-component/pdf-viewer-component.component';
import { SnackBarWhitLinkComponent } from './components/snack-bar-whit-link/snack-bar-whit-link.component';
import { ModalReporteCedularComponent } from './components/modal-reporte-cedular/modal-reporte-cedular.component';


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
    ModalFacturacionComponent,
    ModalValidarReciboOficioComponent,
    ModalOficioHabilitacionComponent,
    SharedToolbarMenuComponent,
    PdfViewerComponentComponent,
    SnackBarWhitLinkComponent,
    ModalReporteCedularComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    MatMenuModule
  ],
  // IMPORTANTE: Añade esta línea
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    SidenavConceptosComponent,
    SharedToolbarComponent,
    SharedToolbarMenuComponent,
    TablaCalculoConceptosComponent,
    LoadSpinnerComponent,
    SegmentTextPipe,
    SnackBarComponent,
    SanitizeUrlPipe
  ]
})
export class SharedModule { }
