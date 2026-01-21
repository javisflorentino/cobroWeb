import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthSiigemService } from './auth-siigem.service';
import { environments } from 'src/environments/environments';

export interface ReporteCedularRequest {
  serie: string;
  folio: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImpuestoCedularService {
  private urlReporteCedular = environments.URL_SIIGEM_REPORTE_CEDULAR;

  constructor(
    private http: HttpClient,
    private authSiigemService: AuthSiigemService
  ) { }

  generarReporte(request: ReporteCedularRequest): Observable<HttpResponse<Blob>> {
    const token = this.authSiigemService.getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(this.urlReporteCedular, request, {
      headers,
      responseType: 'blob',
      observe: 'response'
    });
  }

  descargarArchivo(blob: Blob, filename: string): void {
    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  extraerNombreArchivo(contentDisposition: string | null, serie: string, folio: string): string {
    let filename = `reporte_cedular_${serie}_${folio}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    return filename;
  }
}
