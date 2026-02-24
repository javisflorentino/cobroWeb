import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

import ListaOficinas from '../../../../../../data/arreglos/smyt_oficinas_tramite.json';
import { Oficinas } from 'src/app/portal-hacienda/interface/portal-oficinas.interface';
import { SmytService } from 'src/app/portal-hacienda/services/smyt.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-expedicion-gafete-operador',
  templateUrl: './expedicion-gafete-operador.component.html',
  styleUrls: ['./expedicion-gafete-operador.component.css']
})
export class ExpedicionGafeteOperadorComponent implements OnInit {

  /* Arreglo de oficinas de SMyT */
  public oficinasArr: Oficinas[] = ListaOficinas;

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  /* Se usa para obtener el nombre del concepto seleccionado y mostrarlo en el HTML */
  public nameConcept: string = '';

  /* Inicialización del formulario reactivo */
  public expGafPubForm: FormGroup = this.fb.group({
    id: [''],
    oficina: ['', [Validators.required]],
    concesion: ['', [Validators.required, Validators.minLength(5)]]
  }, {
    validators: [this.validatorsService.existsSeriesPublico('serie', 'placa', 1, 3, '1', 'folio_concesion')]
  });

  private smytSevice = inject(SmytService);
  private router = inject(Router);

  /* MANEJO DE INFORMACION RECIBIDA POR LA URL */
  private activateRaute = inject(ActivatedRoute);
  private ActivatedRouteSubscribe!: Subscription;

  //Se obtiene una referencia a todo el componente que se renderizó en este componente. Se uso el nombre del componente
  private idConcepto: number = 0;
  private tipoForm: number = 0;

  /* CONTROLA EL NOMBRE DEL CONCEPTO Y MOSTRARLO EN HTML */
  public conceptTitle: string = '';

  constructor(private fb: FormBuilder, private validatorsService: ValidatorsService) { }

  ngOnInit(): void {
    this.ActivatedRouteSubscribe = this.activateRaute.params.subscribe(({ idConcepto, tipoForm }) => {
      this.idConcepto = idConcepto;
      this.tipoForm = tipoForm;
      this.conceptTitle = sessionStorage.getItem('concept')!;
    });
  }

  isValidField(field: string) {
    //TODO: Obtener validación desde un servicio
    return this.validatorsService.isValidField(this.expGafPubForm, field);
  }

  onSubmit() {
    this.isLoading = true;

    if (this.expGafPubForm.invalid) {
      this.expGafPubForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    let concesion = this.expGafPubForm.get('concesion')!.value;

    this.smytSevice.obtenerGafeteOperador({ "numeroConcesion": concesion.toUpperCase(), "tramite": 11 })
      .subscribe({
        next: (resp) => {
          if (resp?.success && resp.data) {
            //sessionStorage.setItem('vehicle_data', JSON.stringify({ "numeroConcesion": String(concesion), "tramite": 11}));
            sessionStorage.setItem('datos_cobro', JSON.stringify({folio: concesion,idConcepto: this.idConcepto,tipo_form: this.tipoForm}));
            this.router.navigate(['/pagos/tabla-conceptos', 873, 19]);
            return;
          }
          Swal.fire({ icon: "error", title: "Error!!", text: "La concesión no se encuentra registrada", allowOutsideClick: false });
          this.isLoading = false;
        },
        error: (err) => {
          Swal.fire({ icon: "error", title: "Error!!", text: err.message, allowOutsideClick: false });
          this.isLoading = false;
        }
      })
  }
}
