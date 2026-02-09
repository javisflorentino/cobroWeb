import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Poliza } from 'src/app/portal-hacienda/interface/portal-datos-poliza.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { estadoVehiculo } from '../../interfaces/soap-estadoVehivulo';
import { ValidateFolioPago } from '../../interfaces/soap-validate-folio-pago';
import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
import { ConvertXmlString } from '../../clases/convert-xml-string';
import Swal from 'sweetalert2';
import { ModalOficioHabilitacionComponent } from '../modal-oficio-habilitacion/modal-oficio-habilitacion.component';
import { ModalComprobantePagoComponent } from '../modal-comprobante-pago/modal-comprobante-pago.component';

@Component({
  selector: 'app-modal-validar-recibo-oficio',
  templateUrl: './modal-validar-recibo-oficio.component.html',
  styleUrls: ['./modal-validar-recibo-oficio.component.css']
})
export class ModalValidarReciboOficioComponent {
  private asJson!: ValidateFolioPago;//ValidateVehicle;
    private xmlSring: ConvertXmlString = new ConvertXmlString();
    public generalesService = inject(GeneralesService);
    public dataPoliza = {} as Poliza;
      /* Bloque el boton de Calcular para evitar acciones duplicadas  */
      public buttBlock = false;
  
      //Controla la visualización del Spinner
      public isLoading: boolean = false;
oficiosForm: FormGroup = this.fb.group({
  serie: ['', Validators.required],
  folio: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
  });  captureLineInvalid = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ModalValidarReciboOficioComponent>
  ) { }
  abrirModalPago(event: Event): void {
    event.preventDefault();
    // this.dialogRef.close();
    // // Suponiendo que ya tienes un MatDialog o similar
    // this.dialog.open(ModalComprobantePagoComponent, {
    //   width: '300px',
    //   data: { /* lo que necesites pasar */ }
    // });


    const id = 287;
    const otroParametro = 0;
    this.router.navigate(['/pagos/tabla-conceptos', id, otroParametro]);
    this.dialogRef.close();
  }
  abrirModalRecibo(event: Event): void {
    event.preventDefault();
    this.dialogRef.close();
    // Suponiendo que ya tienes un MatDialog o similar
    this.dialog.open(ModalComprobantePagoComponent, {
      width: '300px',
      data: { /* lo que necesites pasar */ }
    });
  }
  
  
  search(): void {
    this.oficiosForm.markAllAsTouched()
      if (this.oficiosForm?.valid) {
        this.isLoading = true;
        this.buttBlock = true;
        
        let p = this.oficiosForm.get('serie')!.value;
        let s = this.oficiosForm.get('folio')?.value;
        
        this.generalesService.validateFolioPago(p, s)
    .then(response => response.text())
    .then(xml => {
      this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
      const xmlCDATA = this.asJson['soap:Envelope']['soap:Body']['ns2:consultaFolioPagoResponse']?.folioPagoResult;
      
      if (!xmlCDATA) {
        Swal.fire({
          icon: "error", 
          title: "Datos incompletos", 
          text: "No existe el recibo de pago",
          allowOutsideClick: false
        });
        this.isLoading = false;
        this.buttBlock = false;
        return;
      }
      // Parsear el XML dentro del CDATA
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlCDATA['#text'], "text/xml");
        
        // Extraer los valores que necesitas
        const lineaCaptura = xmlDoc.querySelector("LineaCaptura")?.textContent;
        const numeroPoliza = xmlDoc.querySelector("NumeroPoliza")?.textContent;
        const folioPago = xmlDoc.querySelector("FolioPago")?.textContent;
        const idConcepto = xmlDoc.querySelector("Concepto")?.getAttribute("IdConcepto");
        
        /*console.log("Línea de Captura:", lineaCaptura);
        console.log("Número de Póliza:", numeroPoliza);
        console.log("Folio de Pago:", folioPago);
        console.log("ID Concepto:", idConcepto);*/
    
        if (!lineaCaptura || !numeroPoliza || !folioPago || !idConcepto) {
          Swal.fire({
            icon: "error", 
            title: "Datos incompletos", 
            text: "No existe el recibo de pago",
            allowOutsideClick: false
          });
          this.isLoading = false;
          this.buttBlock = false;
          return;
        }
      if (idConcepto === '14683' || idConcepto === '10348' || idConcepto === '14684') {
        // Si hay datos válidos
        this.dialogRef.close();
        sessionStorage.setItem('oficio_data', JSON.stringify({ "lineaCaptura": lineaCaptura, "numeroPoliza": numeroPoliza, "FolioPago": folioPago, "IdConcepto": idConcepto }));
        const dialogRef = this.dialog.open(ModalOficioHabilitacionComponent, {
            width: '550px',
            disableClose: false
          });

      
        this.isLoading = false;
        this.buttBlock = false;
      }else{
        // Mostrar error si no hay coincidencia
        Swal.fire({
          icon: "error", 
          title: "Datos incorrectos", 
          text: "Error: La serie y folio consultada no pertenecen a un pago de oficio de habilitación, verique su pago por favor.",
          allowOutsideClick: false
        });
        this.isLoading = false;
        this.buttBlock = false;
        return;
      }
  
      
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
}
