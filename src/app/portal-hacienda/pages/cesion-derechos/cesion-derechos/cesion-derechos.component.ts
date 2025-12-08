import { Component, OnInit, OnDestroy, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { SmytService } from '../../../services/smyt.service';
import { DatosTramite } from '../../../../shared/interfaces/datos-tramite.interface';
import Swal from 'sweetalert2';

// Importar JSON de tipos de placa pública
import tipoPlacaPublico from '../../../../../../data/arreglos/smyt_tipo_placa_publico.json';

interface TipoPlaca {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-cesion-derechos',
  templateUrl: './cesion-derechos.component.html',
  styleUrls: ['./cesion-derechos.component.css']
})
export class CesionDerechosComponent implements OnInit, OnDestroy {
  // Señal para controlar el estado de carga
  public isLoading = signal(false);
  
  // Arreglo de tipos de placa pública
  public tiposPlaca: TipoPlaca[] = tipoPlacaPublico;
  
  // Formulario reactivo
  public cesionForm!: FormGroup;

  // Servicios inyectados
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private validatorsService = inject(ValidatorsService);
  private smytService = inject(SmytService);

  // Nombre del concepto desde sessionStorage
  public nameConcept: string = '';

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.nameConcept = sessionStorage.getItem('concept') || 'Cesión de Derechos';
  }

  ngOnDestroy(): void {
    console.log('Componente Cesión de Derechos destruido');
  }

  private initForm(): void {
    this.cesionForm = this.fb.group({
      numeroConcesion: ['', [Validators.required, Validators.minLength(3)]],
      numeroConcesionConfirmacion: ['', [Validators.required, Validators.minLength(3)]],
      tipoPlaca: ['', [Validators.required]]
    }, {
      validators: [
        this.validatorsService.isFieldOneEqualFielTwo('numeroConcesion', 'numeroConcesionConfirmacion', 100),
        this.validatorsService.existsSeriesPublico('numeroConcesion', 'numeroConcesion', 101, 1, 'tipoPlaca', 'numeroConcesion')
      ]
    });
  }

  // Envío del formulario
  onSubmit(): void {
    if (this.cesionForm.invalid) {
      this.cesionForm.markAllAsTouched();
      this.showError('Por favor, complete todos los campos correctamente.');
      return;
    }

    // Validar que los números de concesión coincidan
    const numConcesion = this.cesionForm.get('numeroConcesion')?.value;
    const numConcesionConf = this.cesionForm.get('numeroConcesionConfirmacion')?.value;
    
    if (numConcesion !== numConcesionConf) {
      this.showError('Los números de concesión no coinciden.');
      return;
    }

    // Preparar datos para el backend
    const datosTramite: DatosTramite = {
      tramite: 1, // ID del trámite según requerimientos
      placa: '', // No aplica para cesión de derechos
      tipoVehiculo: this.cesionForm.get('tipoPlaca')?.value,
      numeroConcesion: numConcesion
    };

    // Activar loading
    this.isLoading.set(true);

    // Llamar al servicio
    this.smytService.validateVehiclePublico(datosTramite).subscribe({
      next: (resp) => {
        if (resp?.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'La validación de cesión de derechos se realizó correctamente.',
            allowOutsideClick: false,
            confirmButtonText: 'Continuar'
          }).then((result) => {
            if (result.isConfirmed) {
              // Redirigir a la siguiente vista o realizar acción correspondiente
              this.router.navigate(['/pagos/tabla-conceptos', 1]);
            }
          });
        } else {
          this.showError(resp?.mensaje || 'No se pudo procesar la cesión de derechos.');
        }
      },
      error: (err) => {
        this.showError(err.message || 'Error en la comunicación con el servidor.');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  // Validación de campos
  isValidField(field: string): boolean {
    const result = this.validatorsService.isValidField(this.cesionForm, field);
    return !!result; // Convertir a boolean
  }

  // Mostrar error con SweetAlert
  private showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      allowOutsideClick: false
    });
    this.isLoading.set(false);
  }

  // Convertir a mayúsculas en tiempo real
  @HostListener('input', ['$event']) onKeyUp(event: any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  // Redirigir al home
  redirectHome(): void {
    this.router.navigate(['/pagos/dependencias']);
  }
}
