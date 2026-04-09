import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-three-dsecure-modal',
  templateUrl: './three-dsecure-modal.component.html',
  styleUrls: ['./three-dsecure-modal.component.css']
})
export class ThreeDSecureModalComponent implements AfterViewInit {
  safeHtml: SafeHtml | undefined;

  @ViewChild('iframe3ds')
  iframe!: ElementRef;

  constructor(
    // Aquí se declara como privado para que esté disponible en toda la clase
    private dialogRef: MatDialogRef<ThreeDSecureModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { html: string }
  ) { }

  ngAfterViewInit() {
    this.renderHtml();
  }

  renderHtml() {
    const iframeEl = this.iframe.nativeElement;

    // Escuchar cuando el iframe cambie de página (cuando el Back redireccione)
    iframeEl.onload = () => {
      try {
        const currentUrl = iframeEl.contentWindow.location.href;
        console.log("URL actual del iframe:", currentUrl); // <--- Revisa esto en consola
        // Si la URL del iframe ahora es la de nuestro portal, el proceso terminó
        if (currentUrl.includes('pago-exitoso')) {
          /*const urlParams = new URLSearchParams(iframeEl.contentWindow.location.search);
          const status = urlParams.get('status');

          // Cerramos el modal avisando al componente principal
          this.dialogRef.close(status);*/
          this.dialogRef.close('SUCCESS');
        }
      } catch (e) {
        // Es normal que marque error de CORS mientras el iframe esté en el banco
        // Solo nos importa cuando regrese a nuestro dominio
        console.log("Esperando que el iframe regrese a nuestro dominio...");
      }
    };

    const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
    doc.open();
    doc.write(this.data.html);
    doc.close();
  }
  /*renderHtml() {
    const doc = this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow.document;
    doc.open();
    // Inyectamos el HTML tal cual llega de Java (con sus scripts y formularios)
    doc.write(this.data.html);
    doc.close();
  }*/

}
