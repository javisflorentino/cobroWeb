import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from './shared/services/menu.service';
import Swal from 'sweetalert2';

export interface PkArray {
  smytRefrendo: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private router = inject(Router);
  private generalService = inject(MenuService);

  constructor(@Inject(DOCUMENT) document: any) { }
  ngOnInit(): void {
    console.log(document.location.href);
    let pkSearch = 0;
    ['smyt-refrendo', 'smyt-licencia-vehiculo', 'registropublico', 'calidad-aire-multaverif', 'tabla-conceptos/287'].
      forEach(ruta => {
        if (new RegExp(`\\b${ruta}\\b`, "i").test(document.location.href)) {
          switch (ruta) {
            case 'smyt-refrendo':
              pkSearch = 22
              break;
            case 'smyt-licencia-vehiculo':
              pkSearch = 42
              break;
            case 'calidad-aire-multaverif':
              pkSearch = 196
              break;
            case 'tabla-conceptos/287':
              pkSearch = 396
              break;
            case 'registropublico':
              pkSearch = 999;
              break;
          }
          if (pkSearch > 0 && pkSearch < 999) {
            this.generalService.requestConceptosByPk(pkSearch)
              .subscribe({
                next: (concepto) => {
                  if (concepto.length > 0) {
                    sessionStorage.setItem('gestora', concepto[0].gestora.toString());
                    sessionStorage.setItem('route_origen', concepto[0].url.toString());
                    sessionStorage.setItem('movimiento', concepto[0].tipoMovimiento.toString())
                  } else {
                    Swal.fire({ icon: "error", title: `Error !!`, text: 'No se encontro registro con los parámetros enviados, favor de reportarlo al CAT', allowOutsideClick: false });
                  }
                },
                error: (message) => {
                  Swal.fire({ icon: "error", title: `Error !!`, text: `${message}`, allowOutsideClick: false });
                },
              });
          }
        }
      });


    //sessionStorage.clear();
    sessionStorage.removeItem('contribuyente_only');
    sessionStorage.removeItem('vehicle_data');
    sessionStorage.removeItem('vehicle_data_adicional');
    sessionStorage.removeItem('datos_poliza');
    sessionStorage.removeItem('datos_cobro');
    sessionStorage.removeItem('idParent');
    sessionStorage.removeItem('gestora');
    sessionStorage.removeItem('route_origen');
    sessionStorage.removeItem('concept');
    sessionStorage.removeItem('contribuyente');
    sessionStorage.removeItem('datos_poliza');
    sessionStorage.removeItem('repetir_concepto');
    sessionStorage.removeItem('cachestore');

    sessionStorage.removeItem('movimiento');
    if (pkSearch == 0) {
      this.router.navigate(['/pagos/dependencias'])
    }
  }
}
