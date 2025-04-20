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
                    localStorage.setItem('gestora', concepto[0].gestora.toString());
                    localStorage.setItem('route_origen', concepto[0].url.toString());
                    localStorage.setItem('movimiento', concepto[0].tipoMovimiento.toString())
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


    //localStorage.clear();
    localStorage.removeItem('contribuyente_only');
    localStorage.removeItem('vehicle_data');
    localStorage.removeItem('vehicle_data_adicional');
    localStorage.removeItem('datos_poliza');
    localStorage.removeItem('datos_cobro');
    localStorage.removeItem('idParent');
    localStorage.removeItem('gestora');
    localStorage.removeItem('route_origen');
    localStorage.removeItem('concept');
    localStorage.removeItem('contribuyente');
    localStorage.removeItem('datos_poliza');
    localStorage.removeItem('repetir_concepto');
    localStorage.removeItem('cachestore');

    localStorage.removeItem('movimiento');
    if (pkSearch == 0) {
      this.router.navigate(['/pagos/dependencias'])
    }
  }
}
