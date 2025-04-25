import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { ConvertXmlString } from '../../clases/convert-xml-string';
import { estadoVehiculo } from '../../interfaces/soap-estadoVehivulo';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-historico-pagos',
  templateUrl: './modal-historico-pagos.component.html',
  styleUrls: ['./modal-historico-pagos.component.css']
})
export class ModalHistoricoPagosComponent implements OnInit {
  private asJson!: estadoVehiculo;
  public smytSevice = inject(SmytService);
  private xmlSring: ConvertXmlString = new ConvertXmlString();
  public isLoading: boolean = false;
  public buttBlock = false;
  
  paymentForm: FormGroup = this.fb.group({
    placa: ['', Validators.required],
    numeroSerie: ['', Validators.required]
  });
  
  captureLineInvalid = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalHistoricoPagosComponent>,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  search(): void {
    if (this.paymentForm?.valid) {
      this.isLoading = true;
      this.buttBlock = true;
      
      let p = this.paymentForm.get('placa')!.value;
      let s = this.paymentForm.get('numeroSerie')?.value;
      
      this.smytSevice.validateVehicleSoap(p, s)
        .then(response => response.text())
        .then(xml => {
          this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
          const estatusVehiculo = this.asJson['soap:Envelope']['soap:Body']['ns2:obtenEstatusVehiculoResponse'].estatusVehiculo;
          const vehiculo = estatusVehiculo.vehiculo;

          // Verificamos si los campos clave están vacíos
          const vehiculoVacio = !vehiculo.idVehiculo["#text"];
          
          if (vehiculoVacio) {
            // Mostrar error si no hay coincidencia
            Swal.fire({
              icon: "error", 
              title: "Datos incorrectos", 
              text: "No se encontró información para la placa y serie indicadas",
              allowOutsideClick: false
            });
            this.isLoading = false;
            this.buttBlock = false;
            return;
          }

          // Si hay datos válidos, cerrar el diálogo y pasar los datos al componente
          this.dialogRef.close(estatusVehiculo);
          
          // Navegamos a la ruta con los nuevos datos
          // Añadimos un timestamp para forzar la recarga del componente
          const timestamp = new Date().getTime();
          this.router.navigate(['/pagos/historico-pagos'], { 
            state: { 
              vehicleData: estatusVehiculo,
              timestamp: timestamp 
            } 
          });

          this.isLoading = false;
          this.buttBlock = false;
        })
        .catch(err => {
          Swal.fire({
            icon: "error", 
            title: "Error!!", 
            text: "No se pudo obtener respuesta del servicio",
            allowOutsideClick: false
          });
          this.isLoading = false;
          this.buttBlock = false;
        });
    } else {
      // Marcar formulario como inválido
      this.captureLineInvalid = true;
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}