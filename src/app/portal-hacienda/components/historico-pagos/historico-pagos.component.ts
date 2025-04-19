import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EstatusVehiculo, RegistroHistorico, Vehiculo } from 'src/app/shared/interfaces/soap-estadoVehivulo';

@Component({
  selector: 'app-historico-pagos',
  templateUrl: './historico-pagos.component.html',
  styleUrls: ['./historico-pagos.component.css']
})
export class HistoricoPagosComponent {

  isLoading = false;
  vehicleData: Vehiculo | null = null;
  payments: RegistroHistorico[] = [];
  fullData: EstatusVehiculo | null = null;
  constructor(private router: Router) {
    // Obtener los datos del router state si existen
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as { vehicleData: EstatusVehiculo };
      if (state.vehicleData) {

        this.fullData = state.vehicleData;
        this.vehicleData = state.vehicleData.vehiculo;
        console.log('vehicleData:', this.vehicleData);

        this.payments = state.vehicleData.registroHistorico;
      } else {
        // Si no hay datos, redirigir a alguna página de búsqueda o mostrar error
        this.router.navigate(['/pagos/buscar-vehiculo']);
      }
    } else {
      // Si no hay state, redirigir a alguna página de búsqueda
      this.router.navigate(['/pagos/buscar-vehiculo']);
    }
  }
  /* NOTA: CONTROLA LA VISUALIZACION DEL SPINNER */
  /*ngOnInit(): void {
    this.isLoading = true;
    this.vehicleService.getVehicleData().subscribe(data => {
      this.vehicleData = data;
      this.paymentService.getPayments(data.placa).subscribe(payments => {
        this.payments = payments;
        this.isLoading = false;
      });
    });
  }*/
   // Método para volver a la búsqueda
   volver(): void {
    this.router.navigate(['/pagos/buscar-vehiculo']);
  }
  print(): void {
    window.print();
  }
}
