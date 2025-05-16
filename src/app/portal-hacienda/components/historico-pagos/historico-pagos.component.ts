import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalHistoricoPagosComponent } from 'src/app/shared/components/modal-historico-pagos/modal-historico-pagos.component';
import { EstatusVehiculo, RegistroHistorico, Vehiculo } from 'src/app/shared/interfaces/soap-estadoVehivulo';

@Component({
  selector: 'app-historico-pagos',
  templateUrl: './historico-pagos.component.html',
  styleUrls: ['./historico-pagos.component.css']
})
export class HistoricoPagosComponent implements OnInit {

  isLoading = false;
  vehicleData: Vehiculo | null = null;
  payments: RegistroHistorico[] = [];
  fullData: EstatusVehiculo | null = null;
  
  constructor(private router: Router, private dialog: MatDialog) {
    this.loadDataFromState();
  }

  ngOnInit(): void {
    // Inicialización adicional si es necesaria
  }

  // Método para cargar los datos del state
  private loadDataFromState(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as { vehicleData: EstatusVehiculo };
      if (state.vehicleData) {
        this.fullData = state.vehicleData;
        this.vehicleData = state.vehicleData.vehiculo;
        console.log('vehicleData:', this.vehicleData);

        const rawHistorico = state.vehicleData.registroHistorico;
        this.payments = Array.isArray(rawHistorico) ? rawHistorico : [rawHistorico];
        
        //console.log('PAYMENTS:', this.payments);

      } else {
        // Si no hay datos, redirigir a alguna página de búsqueda o mostrar error
        this.router.navigate(['/pagos/dependencias']);
      }
    } else {
      // Si no hay state, redirigir a alguna página de búsqueda
      this.router.navigate(['/pagos/dependencias']);
    }
  }

  // Método para volver a la búsqueda
  volver(): void {
    this.router.navigate(['/pagos/dependencias']);
    this.dialog.open(ModalHistoricoPagosComponent, {
      width: '350px',
      disableClose: false
    });
  }
  
  print(): void {
    window.print();
  }
}