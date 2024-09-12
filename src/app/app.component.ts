import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  ngOnInit(): void {
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

    this.router.navigate(['/pagos/dependencias'])
  }
}
