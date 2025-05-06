import { Component, HostListener, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioButton } from '@angular/material/radio';

import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
import { IngresosService } from 'src/app/portal-hacienda/services/ingresos.service';
import { Recibo, estadoVehiculo } from '../../interfaces/soap-servicios-ingresos';
import { ConvertXmlString } from '../../clases/convert-xml-string';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { ValidatorsService } from '../../services/validators.service';

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
    codigoReimpresion: ['', [
      Validators.required,
      Validators.pattern('^[0-9]*$') // Solo números
    ]],
    serie: ['', Validators.required],
    folio: ['', [
      Validators.required,
      Validators.pattern('^[0-9]*$') // Solo números
    ]],
    correoElectronico: ['', [
      Validators.required,
      Validators.email // Formato de correo electrónico
    ]],
    formaPago: ['', Validators.required],
    rfc: ['', [
      Validators.required,
      Validators.pattern(this.validatorsService.rfcPath),
      Validators.minLength(12),
      Validators.maxLength(13)
    ]],
    nombreRazonSocial: ['', Validators.required],
    regimenFiscal: ['', Validators.required],
    usoCfdi: ['', Validators.required],
    codigoPostal: ['', [
      Validators.required,
      Validators.pattern('^[0-9]{5}$') // 5 dígitos, solo números
    ]]
  });
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModalFacturacionComponent>,
    private validatorsService:ValidatorsService
  ) {}
  @HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }
  ngOnInit(): void {
    
  }
  async obtenerCfdi(): Promise<void> {
    this.cfdiForm.markAllAsTouched()
    if (this.cfdiForm.invalid) {
      await Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Por favor complete correctamente todos los campos requeridos.'
      });
      return;
    }
  
    this.isLoading = true; // Comienza carga
  
    const lineaCaptura = this.cfdiForm.get("codigoReimpresion")?.value;
    const serie = this.cfdiForm.get("serie")?.value;
    const folio = this.cfdiForm.get("folio")?.value;
    const email = this.cfdiForm.get("correoElectronico")?.value;
    const pago = this.cfdiForm.get("formaPago")?.value;
    const uso = this.cfdiForm.get("usoCfdi")?.value;
    const rfc = this.cfdiForm.get("rfc")?.value;
    let reg=this.cfdiForm.get("regimenFiscal")?.value;
    const regimen = reg.substring(0, 3);
    const cp = this.cfdiForm.get("codigoPostal")?.value;
    const nombre = this.cfdiForm.get("nombreRazonSocial")?.value;
    const lineaCapturaSerieFolio = `${lineaCaptura}/${serie}-${folio}`;
  
    try {
      const consultarCFDResponse = await this.ingresosSevice.consultarCFDSoap(lineaCaptura);
  
      if (!consultarCFDResponse) {
        throw new Error(`No se pudo obtener información para la línea de captura ${lineaCaptura}`);
      }
  
      this.asJson = this.xmlSring.xmlStringToJson(consultarCFDResponse.toString());
  
      if (!this.asJson['soap:Envelope'] || 
          !this.asJson['soap:Envelope']['soap:Body'] || 
          !this.asJson['soap:Envelope']['soap:Body']['ConsultarCFDResponse'] ||
          !this.asJson['soap:Envelope']['soap:Body']['ConsultarCFDResponse'].ConsultarCFDResult) {
        throw new Error('La línea de captura no es válida');
      }
  
      const cfd = this.asJson['soap:Envelope']['soap:Body']['ConsultarCFDResponse'].ConsultarCFDResult;
  
      if (!cfd?.RFC || !cfd?.Serie || !cfd?.Folio) {
        throw new Error('La información del CFD está incompleta');
      }
  
      const rfcCFD = cfd.RFC['#text'];
      const serieCFD = cfd.Serie['#text'];
      const folioCFD = cfd.Folio['#text'];
  
      if (rfcCFD?.toUpperCase() !== rfc.toUpperCase()) {
        await Swal.fire({
          icon: "error", 
          title: "Error de validación", 
          text: `El RFC capturado no corresponde con el del comprobante de pago de la línea de captura ${lineaCaptura}.`,
          allowOutsideClick: false
        });
        return;
      }
  
      if (serieCFD?.toUpperCase() !== serie.toUpperCase() || folioCFD !== folio) {
        await Swal.fire({
          icon: "error", 
          title: "Error de validación", 
          text: `La serie o folio capturado no corresponde con el del comprobante de pago de la línea de captura ${lineaCaptura}.`,
          allowOutsideClick: false
        });
        return;
      }
  
      const resultadoTimbre = await this.ingresosSevice.timbraCP(
        lineaCapturaSerieFolio, 
        pago, 
        uso, 
        cp, 
        regimen, 
        nombre
      );
  
      if (resultadoTimbre.includes('<TimbraCFDResult>true</TimbraCFDResult>') || resultadoTimbre.includes('<TimbraCFDResult>1</TimbraCFDResult>')) {
        await Swal.fire({
          icon: 'success',
          title: 'Timbrado exitoso',
          text: 'El CFDI se timbró correctamente.'
        });
  
        try {
          const envioResponse = await firstValueFrom(
            this.generalesService.envioCDFI(lineaCaptura, serie, folio, email)
          );
        
          if (envioResponse) {
            await Swal.fire({
              icon: 'success',
              title: 'Correo enviado',
              text: 'El CFDI se envió correctamente al destinatario.'
            });
          } else {
            await Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: 'El timbrado fue exitoso, pero no se pudo enviar el correo electrónico.'
            });
          }
        } catch (emailError) {
          console.error("Error al enviar correo:", emailError);
          await Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'El timbrado fue exitoso, pero ocurrió un error al enviar el correo electrónico.'
          });
        }
        const urlPDF = `https://app.hacienda.morelos.gob.mx/recibo/cfdi/imprimirCfdi?lineaCaptura=${lineaCaptura}`;
        window.open(urlPDF, '_blank');
        this.dialogRef.close();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error al timbrar',
          text: 'No se pudo realizar el timbrado del CFDI.'
        });
      }
    } catch (err) {
      console.error("Error en el proceso:", err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'Error inesperado al timbrar o enviar el comprobante.'
      });
    } finally {
      this.isLoading = false; // Termina carga en cualquier caso
    }
  }
  
  close(): void {
    this.dialogRef.close();
  }
  includesValue(value: string): boolean {
    const regimenFiscal = this.cfdiForm.get('regimenFiscal')?.value;
    if (!regimenFiscal || regimenFiscal === '/') return false;
    return regimenFiscal.includes(value);
  }
}
