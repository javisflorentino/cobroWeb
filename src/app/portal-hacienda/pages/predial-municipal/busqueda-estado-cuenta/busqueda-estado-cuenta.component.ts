import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';


import { SnackBarComponent } from 'src/app/shared/components/snack-bar/snack-bar.component';import { ComboConcept } from 'src/app/portal-hacienda/interface/datos-combo.interface';
import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
import { EstadoCuenta, EstadoCuentaRequest, PredialMunicipalService } from 'src/app/portal-hacienda/services/predial-municipal.service';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { PdfViewerComponentComponent } from 'src/app/shared/components/pdf-viewer-component/pdf-viewer-component.component';
import { AuthSiigemService } from 'src/app/shared/services/auth-siigem.service';
import { DetalleMunicipio } from 'src/app/shared/interfaces/detalle-municipio';
import { map, switchMap, tap } from 'rxjs';

// Importar directamente los archivos JSON
import regimenData from '../../../../../../data/arreglos/regimen.json';
import usoCfdiData from '../../../../../../data/arreglos/usoCfdi.json';
@Component({
  selector: 'app-busqueda-estado-cuenta',
  templateUrl: './busqueda-estado-cuenta.component.html',
  styleUrls: ['./busqueda-estado-cuenta.component.css']
})
export class BusquedaEstadoCuentaComponent {
  //Controla la visualización del Spinner
  public isLoading: boolean = false;
    public pkMunicipio: number = 0;
  /* Se usa para obtener el nombre del concepto seleccionado y mostrarlo en el HTML */
  public nameConcept: string = '';

  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;
  public municipiosArr: ComboConcept[] = [];
  public conceptTitle: string = '';
  public detalleMunicipio: DetalleMunicipio | null = null;
  
  public predialMunicipal: FormGroup = this.fb.group({
    claveCatastral: [''],
    validador: ['', [Validators.required]],
    tipoPersona: ['1', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    confirmarCorreo: [''],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    timbrar: [false],
    codigoPostal: [''],
    regimen: [''],
    usoCfdi: [''],
    rfc: ['']
  }, {
    validators: []
  });
  private predialService = inject(PredialMunicipalService);
    private authSiigemService = inject(AuthSiigemService);

  public validadorLabel: string = 'Identificador'; // Valor por defecto
  public claveLabel: string = 'Clave Catastral'; // Valor por defecto
  
  // Opciones para los combos de timbrar
  public regimenOptions: any[] = regimenData;
  public usoCfdiOptions: any[] = usoCfdiData;



  constructor(
      private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    private router: Router,
    private generalesService: GeneralesService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
    ) { }
    ngOnInit(): void {
      sessionStorage.removeItem('datosPago');
    
      this.route.paramMap.pipe(
        // Mapeamos el parámetro idConcepto
        map(params => parseInt(params.get('idConcepto') || '0')),
        tap(pk => {
          this.pkMunicipio = pk;
    
          if (pk === 0) {
            this.openSnackBar('No se pudo obtener el municipio de la URL');
            // this.router.navigate(['/']);
          }
    
          // Cambia el label según el municipio
          this.setValidadorLabel();
          
          // Agregar validación de confirmación de correo solo para municipio 17
          if (pk === 17) {
            this.predialMunicipal.get('confirmarCorreo')?.setValidators([Validators.required, Validators.email]);
            this.predialMunicipal.setValidators([
              this.validatorsService.isFieldOneEqualFielTwo('correo', 'confirmarCorreo', 1)
            ]);
          } else {
            this.predialMunicipal.get('confirmarCorreo')?.clearValidators();
            this.predialMunicipal.clearValidators();
          }
          this.predialMunicipal.get('confirmarCorreo')?.updateValueAndValidity();
          this.predialMunicipal.updateValueAndValidity();
        }),
        // Llamamos al servicio una vez que pkMunicipio está definido
        switchMap(pk => this.predialService.getDetalleMunicipio(pk))
      ).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.detalleMunicipio = response.data;
          } else {
            this.openSnackBar('No se encontró información para los datos proporcionados');
          }
        },
        error: (err) => {
          console.error('Error al obtener detalle del municipio', err);
          this.detalleMunicipio = null;
        }
      });
    
      this.conceptTitle = sessionStorage.getItem('concept')!;
    
      this.authSiigemService.login().subscribe({
        next: (res) => console.log('Login exitoso', res),
        error: (err) => console.error('Error al autenticar', err)
      });
    }
    

setValidadorLabel() {
  switch (this.pkMunicipio) {
    case 4:
      this.validadorLabel = 'Importe de Último Pago';
      break;
    case 6:
      this.validadorLabel = 'Importe de Último Pago';
      break;
    case 7:
      this.validadorLabel = 'Importe de Último Pago';
      break;
    case 20:
      this.validadorLabel = 'Importe de Último Pago';
      break;
    case 27:
      this.claveLabel = 'Clave Catastral/Cuenta Predial';
      this.validadorLabel = 'Iniciales Nombre';
      break;
    // Agrega más casos según tus necesidades
    default:
      this.validadorLabel = 'Iniciales Nombre';
  }
}
  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,
      duration: 5500,
      panelClass: ["snack-notification"],
      horizontalPosition: "center",
      verticalPosition: "top",
    });
  }

  onTimbrarChange(): void {
    const timbrarValue = this.predialMunicipal.get('timbrar')?.value;
    
    if (timbrarValue === true) {
      // Si se selecciona "Sí" para timbrar, agregar validaciones requeridas
      this.predialMunicipal.get('codigoPostal')?.setValidators([Validators.required, Validators.pattern(/^\d{5}$/)]);
      this.predialMunicipal.get('regimen')?.setValidators([Validators.required]);
      this.predialMunicipal.get('usoCfdi')?.setValidators([Validators.required]);
      this.predialMunicipal.get('rfc')?.setValidators([Validators.required, Validators.pattern(this.validatorsService.rfcFisica)]);
    } else {
      // Si se selecciona "No" o se cambia a false, limpiar validaciones
      this.predialMunicipal.get('codigoPostal')?.clearValidators();
      this.predialMunicipal.get('regimen')?.clearValidators();
      this.predialMunicipal.get('usoCfdi')?.clearValidators();
      this.predialMunicipal.get('rfc')?.clearValidators();
      
      // Limpiar valores
      this.predialMunicipal.get('codigoPostal')?.setValue('');
      this.predialMunicipal.get('regimen')?.setValue('');
      this.predialMunicipal.get('usoCfdi')?.setValue('');
      this.predialMunicipal.get('rfc')?.setValue('');
    }
    
    // Actualizar validaciones
    this.predialMunicipal.get('codigoPostal')?.updateValueAndValidity();
    this.predialMunicipal.get('regimen')?.updateValueAndValidity();
    this.predialMunicipal.get('usoCfdi')?.updateValueAndValidity();
    this.predialMunicipal.get('rfc')?.updateValueAndValidity();
  }

  onSubmit(): void {
     // Validar que el formulario sea válido
    if (this.predialMunicipal.invalid) {
      this.predialMunicipal.markAllAsTouched();
      this.openSnackBar('Por favor complete todos los campos requeridos correctamente');
      return;
    }

    // Bloquear el botón y mostrar loading
    this.buttBlock = true;
    this.isLoading = true;

    // Preparar los datos para el request
    const requestData: EstadoCuentaRequest = {
      pkMunicipio: this.pkMunicipio,
      clave: this.predialMunicipal.get('claveCatastral')?.value.trim(),
      validador: this.predialMunicipal.get('validador')?.value.trim(),
      tipoPersona: this.predialMunicipal.get('tipoPersona')?.value,
      correo: this.predialMunicipal.get('correo')?.value.trim(),
      telefono: this.predialMunicipal.get('telefono')?.value.trim(),
      timbrar: this.predialMunicipal.get('timbrar')?.value,
      codigoPostal: this.predialMunicipal.get('codigoPostal')?.value.trim(),
      regimen: this.predialMunicipal.get('regimen')?.value.trim(),
      usoCfdi: this.predialMunicipal.get('usoCfdi')?.value.trim(),
      rfc: this.predialMunicipal.get('rfc')?.value.trim()
    };
    console.log(JSON.stringify(requestData));
    // Consumir el endpoint
    this.predialService.consultarEstadoCuenta(requestData)
      .subscribe({
        next: (response) => {

          this.isLoading = false;
          this.buttBlock = false;

          if (response && response.data) {
            if(response.data.cobrable){
              // Mostrar la ventanita con los datos antes de mostrar el PDF
              this.mostrarInformacionEstadoCuenta(response.data, response.data.archivo);
            }else{
              this.openSnackBar(response.data.mensaje || 'No existe la clave catastral');

            }
            
            
          } else {
            this.openSnackBar('No se encontró información para los datos proporcionados');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.buttBlock = false;
          
          console.error('Error al consultar estado de cuenta:', error);
          
          if (error.status === 404) {
            this.openSnackBar('No se encontró información para los datos proporcionados');
          } else if (error.status === 400) {
            this.openSnackBar('Los datos proporcionados no son válidos');
          } else if (error.status === 500) {
            this.openSnackBar('Error interno del servidor. Intente más tarde');
          } else {
            this.openSnackBar('Error al consultar el estado de cuenta. Verifique su conexión');
          }
        }
      });
  
     
  
    }

  
  private mostrarInformacionEstadoCuenta(data: any, archivoBase64: string): void {
    Swal.fire({
      title: 'Estado de Cuenta Consultado',
      html: `
        <div style="text-align: left;">
          <p><strong>Clave:</strong> ${data.clave}</p>
          <p><strong>Referencia:</strong> ${data.referencia}</p>
          <p><strong>Importe:</strong> ${data.importeTotal.toLocaleString('es-MX', { 
  style: 'currency', 
  currency: 'MXN' 
})}</p>
        </div>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Ver PDF',
      cancelButtonText: 'Solo Consultar',
      confirmButtonColor: 'var(--primary-color)',
      width: '450px'
    }).then((result) => {
      if (result.isConfirmed) {
        // Ahora sí, mostrar el PDF y continuar el flujo normal
        this.abrirPDF(archivoBase64, data);
      }
    });
  }

  private abrirPDF(archivoBase64: string, data: EstadoCuenta): void {
    try {
    data.tipoPersona=this.predialMunicipal.get('tipoPersona')?.value;
    data.correo=this.predialMunicipal.get('correo')?.value;
    data.validador=this.predialMunicipal.get('validador')?.value;
    data.telefono=this.predialMunicipal.get('telefono')?.value;
    console.log(archivoBase64);  
      // Convertir base64 a blob
      const byteCharacters = atob(archivoBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Crear URL para el blob
      const url = window.URL.createObjectURL(blob);
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
// Preparar datos para el pago si están disponibles
      
      // Abrir el componente modal con el PDF
      const dialogRef = this.dialog.open(PdfViewerComponentComponent, {
        width: '90%',
        height: '90%',
        data: { 
          pdfUrl: safeUrl,
          fileName: `estado_cuenta_${new Date().getTime()}.pdf`,
          titulo: 'Estado de Cuenta Predial',
          mostrarBotonPago: true,
          estadoCuentaData: data
        }
      });

      dialogRef.afterClosed().subscribe((resultado) => {
        // Si el usuario eligió proceder al pago
        if (resultado && resultado.accion === 'pago') {
          this.navegarAPago(resultado.datos);
        }
        // Limpiar la URL del blob cuando se cierre el modal
        window.URL.revokeObjectURL(url);
        
      });

    } catch (error) {
      console.error('Error al procesar el archivo PDF:', error);
      this.openSnackBar('Error al mostrar el archivo PDF');
    }
  }
  private navegarAPago(data: EstadoCuenta): void {
    // Preparar los datos para el componente de pago
 
    

    console.log(JSON.stringify(data))
    sessionStorage.setItem('datosPago', JSON.stringify(data));
    sessionStorage.setItem('contribuyente', JSON.stringify({ data: { total: Number(0), conceptos: null, lineaDetalle: null }, success: true }));//this.conceptoPago));

    // Navegar al componente de pago pasando los datos
    this.router.navigate(['pagos/generar_poliza']);
  }
}
