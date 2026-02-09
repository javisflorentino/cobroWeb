import { Component, HostListener, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidateFolioPago } from '../../interfaces/soap-validate-folio-pago';
import { ConvertXmlString } from '../../clases/convert-xml-string';
import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
import Swal from 'sweetalert2';
import { MatDialogRef } from '@angular/material/dialog';
import { InsertarPersonaOficio } from '../../interfaces/soap-insertar-persona-oficio';
import { ValidatorsService } from '../../services/validators.service';

@Component({
  selector: 'app-modal-oficio-habilitacion',
  templateUrl: './modal-oficio-habilitacion.component.html',
  styleUrls: ['./modal-oficio-habilitacion.component.css']
})
export class ModalOficioHabilitacionComponent {
  private asJson!: InsertarPersonaOficio;//ValidateVehicle;
      private xmlSring: ConvertXmlString = new ConvertXmlString();
      public generalesService = inject(GeneralesService);
      public validatorsService = inject(ValidatorsService);
        /* Bloque el boton de Calcular para evitar acciones duplicadas  */
        public buttBlock = false;
    
        //Controla la visualización del Spinner
        public isLoading: boolean = false;
  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModalOficioHabilitacionComponent>
  ) { }
@HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }
  habilitacionForm: FormGroup = this.fb.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?! )[A-Za-zÁÉÍÓÚÑáéíóúñ ]*(?:[A-Za-zÁÉÍÓÚÑáéíóúñ]){2,}[A-Za-zÁÉÍÓÚÑáéíóúñ ]*(?<! )$/
)

      ]
    ],
    apellidoPaterno: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?! )[A-Za-zÁÉÍÓÚÑáéíóúñ ]*(?:[A-Za-zÁÉÍÓÚÑáéíóúñ]){2,}[A-Za-zÁÉÍÓÚÑáéíóúñ ]*(?<! )$/
)

      ]
    ],
    apellidoMaterno: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?! )[A-Za-zÁÉÍÓÚÑáéíóúñ ]*(?:[A-Za-zÁÉÍÓÚÑáéíóúñ]){2,}[A-Za-zÁÉÍÓÚÑáéíóúñ ]*(?<! )$/
)

      ]
    ],
    correoElectronico: ['', [Validators.required, Validators.email]],
    curp: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]{2}$/
        )
      ]
    ],
    rfc: [
      '',
      [
        Validators.required,
        Validators.pattern(this.validatorsService.rfcPath)
      ]
    ],
    telefono: [''],
    sexo: ['M', Validators.required],
    dependencia: ['', Validators.required],
    tipoDependencia: ['secretaria', Validators.required],
    nivelGobierno: ['Estatal', Validators.required],
    tipoPoder: ['Ejecutivo', Validators.required]
  });
  


  solicitar(): void {
    this.habilitacionForm.markAllAsTouched()
        if (this.habilitacionForm?.valid) {
          this.isLoading = true;
          this.buttBlock = true;
          
          const nombre = this.habilitacionForm.get('nombre')!.value;
          const apellidoPaterno = this.habilitacionForm.get('apellidoPaterno')!.value;
          const apellidoMaterno = this.habilitacionForm.get('apellidoMaterno')!.value;
          const rfc = this.habilitacionForm.get('rfc')!.value;
          const curp = this.habilitacionForm.get('curp')!.value;
          const sexo = this.habilitacionForm.get('sexo')!.value;
          const telefono = this.habilitacionForm.get('telefono')!.value;
          const correo = this.habilitacionForm.get('correoElectronico')!.value;
          const dependencia = this.habilitacionForm.get('dependencia')!.value;
          const tipoDependencia = this.habilitacionForm.get('tipoDependencia')!.value;
          const nivel = this.habilitacionForm.get('nivelGobierno')!.value;
          const poder = this.habilitacionForm.get('tipoPoder')!.value;
          const hoy = new Date();
          const dia = String(hoy.getDate()).padStart(2, '0');
          const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
          const anio = hoy.getFullYear();
          
          const fecha = `${dia}/${mes}/${anio}`;
          const valores = sessionStorage.getItem('oficio_data');

          const { FolioPago, lineaCaptura, numeroPoliza, IdConcepto } = JSON.parse(valores!);
          const folioDeclaracion = "FOLIO";

          //const folioDeclaracion = "SAyBG/DGR/W"+numeroPoliza+"/"+anio.toString();
          
          this.generalesService.insertarPersona(
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            rfc,
            curp,
            sexo,
            telefono,
            correo,
            dependencia,
            tipoDependencia,
            nivel,
            poder,
            folioDeclaracion,
            fecha,
            FolioPago,
            lineaCaptura,
            numeroPoliza
          )
      .then(response => response.text())
      .then(xml => {
        this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
        const result = this.asJson['soap:Envelope']['soap:Body']['ns2:insertaPeticionResponse'].resultado;
      
        if (result && result['#text'].trim() !== '') {
          // Si hay datos válidos
          this.dialogRef.close();
         
          Swal.fire({
            icon: "success",
            title: "Advertencia",
            text: result['#text'].trim(),
            allowOutsideClick: false
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
        }
      }
  
}
