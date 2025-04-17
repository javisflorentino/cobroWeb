import { Component, inject } from '@angular/core';
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
export class ModalHistoricoPagosComponent {
  private asJson!: estadoVehiculo;//ValidateVehicle;
    public smytSevice = inject(SmytService);
    private xmlSring: ConvertXmlString = new ConvertXmlString();
    public isLoading: boolean = false;
    /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;
paymentForm: FormGroup = this.fb.group({
    placa: ['', Validators.required],
    numeroSerie: ['', Validators.required]
  });  captureLineInvalid = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalHistoricoPagosComponent>,
    private router: Router
  ) { }

  ngOnInit(): void {
    
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
          
          // Si la respuesta es exitosa, cerramos el diálogo y navegamos
          this.dialogRef.close(estatusVehiculo);
          
          // Navegar a la página de histórico con los datos
          this.router.navigate(['/pagos/historico-pagos'], { 
            state: { vehicleData: estatusVehiculo } 
          });

          this.isLoading = false;
          this.buttBlock = false;
        })
        .catch(err => {
          Swal.fire({
            icon: "error", 
            title: "Error!!", 
            text: "No se encontró información para la placa y serie indicadas",
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
