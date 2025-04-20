import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalHistoricoPagosComponent } from 'src/app/shared/components/modal-historico-pagos/modal-historico-pagos.component';
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
  constructor(private router: Router, private dialog: MatDialog) {
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
    const dialogRef = this.dialog.open(ModalHistoricoPagosComponent, {
            width: '350px',
            disableClose: false
          });
    
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log('Datos del formulario:', result);
              // Aquí puedes manejar los datos recibidos del diálogo
            }
          });
  }
  print(): void {
    window.print();
  }
}
