import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidateFolioPago } from '../../interfaces/soap-validate-folio-pago';
import { ConvertXmlString } from '../../clases/convert-xml-string';
import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
import Swal from 'sweetalert2';
import { MatDialogRef } from '@angular/material/dialog';
import { InsertarPersonaOficio } from '../../interfaces/soap-insertar-persona-oficio';

@Component({
  selector: 'app-modal-oficio-habilitacion',
  templateUrl: './modal-oficio-habilitacion.component.html',
  styleUrls: ['./modal-oficio-habilitacion.component.css']
})
export class ModalOficioHabilitacionComponent {
  private asJson!: InsertarPersonaOficio;//ValidateVehicle;
      private xmlSring: ConvertXmlString = new ConvertXmlString();
      public generalesService = inject(GeneralesService);
        /* Bloque el boton de Calcular para evitar acciones duplicadas  */
        public buttBlock = false;
    
        //Controla la visualización del Spinner
        public isLoading: boolean = false;
  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModalOficioHabilitacionComponent>
  ) { }

  habilitacionForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: ['', Validators.required],
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
        Validators.pattern(
          /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/
        )
      ]
    ],
    telefono: [''],
    sexo: ['masculino', Validators.required],
    dependencia: ['', Validators.required],
    tipoDependencia: ['secretaria', Validators.required],
    nivelGobierno: ['estatal', Validators.required],
    tipoPoder: ['ejecutivo', Validators.required]
  });


  solicitar(): void {
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
          const folioDeclaracion = "Folio";
          const hoy = new Date();
          const dia = String(hoy.getDate()).padStart(2, '0');
          const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
          const anio = hoy.getFullYear();
          
          const fecha = `${dia}/${mes}/${anio}`;
          const valores = localStorage.getItem('oficio_data');

          const { folioPago, lineaCaptura, numeroPoliza, IdConcepto } = JSON.parse(valores!);

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
            folioPago,
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
