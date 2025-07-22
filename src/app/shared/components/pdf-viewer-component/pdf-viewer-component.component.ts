import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
export interface PdfViewerData {
  pdfUrl: SafeResourceUrl;
  fileName: string;
  titulo?: string; // Título personalizable
  mostrarBotonPago?: boolean; // Controla si se muestra el botón de pago
  estadoCuentaData?: any; // Datos del estado de cuenta para el pago
}
@Component({
  selector: 'app-pdf-viewer-component',
  templateUrl: './pdf-viewer-component.component.html',
  styleUrls: ['./pdf-viewer-component.component.css']
})
export class PdfViewerComponentComponent {
constructor(
    public dialogRef: MatDialogRef<PdfViewerComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PdfViewerData,
     private router: Router
  ) {}

  descargarPDF(): void {
    try {
      // Crear un enlace temporal para descargar
      const link = document.createElement('a');
      link.href = this.data.pdfUrl as string;
      link.download = this.data.fileName;
      link.click();
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
    }
  }
 procederPago(): void {
    if (this.data.estadoCuentaData) {
      // Cerrar el modal y emitir los datos para el pago
      this.dialogRef.close({ accion: 'pago', datos: this.data.estadoCuentaData });
    }
  }
  cerrar(): void {
    this.dialogRef.close();
  }
}
