import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImpuestoCedularService, ReporteCedularRequest } from 'src/app/shared/services/impuesto-cedular.service';

@Component({
  selector: 'app-modal-reporte-cedular',
  templateUrl: './modal-reporte-cedular.component.html',
  styleUrls: ['./modal-reporte-cedular.component.css']
})
export class ModalReporteCedularComponent {
  
  reporteForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalReporteCedularComponent>,
    private impuestoCedularService: ImpuestoCedularService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.reporteForm = this.fb.group({
      serie: ['', Validators.required],
      folio: ['', Validators.required],
      lineaCaptura: [''],
    });
  }

  generarReporte(): void {
    if (this.reporteForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const request: ReporteCedularRequest = this.reporteForm.value;

      this.impuestoCedularService.generarReporte(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Obtener el nombre del archivo
          const contentDisposition = response.headers.get('Content-Disposition');
          const filename = this.impuestoCedularService.extraerNombreArchivo(
            contentDisposition, 
            request.serie, 
            request.folio
          );

          // Descargar el archivo
          this.impuestoCedularService.descargarArchivo(response.body as Blob, filename);
          
          this.dialogRef.close();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al generar reporte:', error);
          
 
            this.errorMessage = 'No se encontró registro del recibo ingresado, favor de verificar';
          
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
