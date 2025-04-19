import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
import { IngresosService } from 'src/app/portal-hacienda/services/ingresos.service';
import { Recibo, estadoVehiculo } from '../../interfaces/soap-servicios-ingresos';
import { ConvertXmlString } from '../../clases/convert-xml-string';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-facturacion',
  templateUrl: './modal-facturacion.component.html',
  styleUrls: ['./modal-facturacion.component.css']
})
export class ModalFacturacionComponent {
  private asJson!: estadoVehiculo;//ValidateVehicle;
    private xmlSring: ConvertXmlString = new ConvertXmlString();
    public isLoading: boolean = false;
  public ingresosSevice = inject(IngresosService);
  public generalesService = inject(GeneralesService);


  cfdiForm: FormGroup = this.fb.group({
    codigoReimpresion: ['', Validators.required],
    serie: ['', Validators.required],
    folio: ['', Validators.required],
    correoElectronico: ['', [Validators.email]],
    formaPago: ['', Validators.required],
    rfc: ['', Validators.required],
    nombreRazonSocial: ['', Validators.required],
    regimenFiscal: ['', Validators.required],
    usoCfdi: ['', Validators.required],
    codigoPostal: ['', Validators.required]
  });
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModalFacturacionComponent>
  ) {}

  ngOnInit(): void {
    
  }
  async obtenerCfdi(
   
  ): Promise<string> {
    const lineaCaptura = this.cfdiForm.get("codigoReimpresion")?.value;
    const serie = this.cfdiForm.get("serie")?.value;
    const folio = this.cfdiForm.get("folio")?.value;
    const email = this.cfdiForm.get("correoElectronico")?.value;
    const pago = this.cfdiForm.get("formaPago")?.value;
    const uso = this.cfdiForm.get("usoCfdi")?.value;
    const rfc = this.cfdiForm.get("rfc")?.value;
    const regimen = this.cfdiForm.get("regimenFiscal")?.value;
    const cp = this.cfdiForm.get("codigoPostal")?.value;
    const nombre = this.cfdiForm.get("nombreRazonSocial")?.value;
    const lineaCapturaSerieFolio = `${lineaCaptura}/${serie}-${folio}`;
    
  
    try {
      // 1. Consultar CFD
      const consultarCFDResponse = await this.ingresosSevice.consultarCFDSoap(lineaCaptura);
      this.asJson = this.xmlSring.xmlStringToJson(consultarCFDResponse.toString());
      const cfd = this.asJson['soap:Envelope']['soap:Body']['ConsultarCFDResponse'].ConsultarCFDResult;

      const rfcCFD = cfd?.RFC['#text'];
      const serieCFD = cfd?.Serie['#text'];
      const folioCFD = cfd?.Folio['#text'];
      console.log(rfcCFD)

      if (rfcCFD !== rfc) {
        Swal.fire({
          icon: "error", 
          title: "Error!!", 
          text:  `El RFC capturado no corresponde con el del comprobante de pago de la línea de captura ${lineaCaptura}.`,
          allowOutsideClick: false
        });
      }
  
      if (serieCFD !== serie || folioCFD !== folio) {
        return `La serie o folio capturado no corresponde con el del comprobante de pago de la línea de captura ${lineaCaptura}.`;
      }
  
      // 2. Timbrar
      const resultadoTimbre = "1"//await this.ingresosSevice.timbraCP(lineaCapturaSerieFolio, pago, uso, cp, regimen, nombre);
  
      if (resultadoTimbre.includes('true') || resultadoTimbre.includes('1')) {
        // 3. Enviar por correo
       // const resultadoEnvio = await this.generalesService.envioCDFI(lineacaptura, email, serie, folio);
        return "1"//resultadoEnvio;
      } else {
        return resultadoTimbre;
      }
    } catch (err) {
      console.error("Error en timbrado o envío:", err);
      return 'Error inesperado al timbrar o enviar el comprobante.';
    }
  }
  

  close(): void {
    this.dialogRef.close();
  }
}
