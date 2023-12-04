import { Component, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

@Component({
  selector: 'hacienda-reintegros-pages',
  templateUrl: './reintegros-pages.component.html',
  styles: [
  ]
})
export class ReintegrosPagesComponent implements OnInit, OnDestroy {

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  public conceptTitle: string = '';

  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;

  private ActivatedRouteSubscribe?: Subscription;

  //Se obtiene una referencia a todo el componente que se renderizó en este componente. Se uso el nombre del componente
  private idConcepto: number = 0;
  private tipoForm: number = 0;

  private fb = inject( FormBuilder );
  public myFormHReintegro: FormGroup = this.fb.group(
    {
      nombre:   ['', [Validators.required, Validators.pattern(this.validatorService.peoplesNamePath)]],
      telefono: ['', [Validators.required, Validators.pattern(this.validatorService.expNoTel)]],
      email:    ['', [Validators.required, Validators.pattern(this.validatorService.emailPattern)]],
      monto:    [1, [Validators.required, Validators.min(1), Validators.pattern(this.validatorService.numberPattern)]]
    }
  );

  @HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  constructor( private validatorService: ValidatorsService, private router: Router, private activateRaute: ActivatedRoute ) {}

  ngOnInit(): void {
    this.ActivatedRouteSubscribe = this.activateRaute.params.subscribe(({idConcepto,tipoForm}) => {
      this.idConcepto = idConcepto;
      this.tipoForm = tipoForm;
      this.conceptTitle = localStorage.getItem('concept')!;
    });
  }

  ngOnDestroy(): void {
    //this.activateRaute.params.subscribe().unsubscribe();
    console.log('Destruction Impuestos-page');
    this.ActivatedRouteSubscribe?.unsubscribe();
  }

  getMessage(idMssg:ValidationErrors|null|undefined, nameField:string) {
    console.log(nameField)
    if ( !idMssg ) {
      return '';
    }
    const errors = Object.keys(idMssg);
    console.log(errors)
    if(errors.includes('required')) {
      return 'Este campo requerido';
    }
    if(errors.includes('min')) {
      return 'No se permite valor menor a 1';
    }
    if(errors.includes('pattern')) {
      return 'Formato incorrecto';
    }

    return '';
  }

  onSubmit() {
    this.isLoading = true;
    this.buttBlock = true;
    if ( this.myFormHReintegro.invalid ) {
      this.myFormHReintegro.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }
    localStorage.setItem('route_origen',`hacienda/hacienda-reintegros/${this.idConcepto}/${this.tipoForm}`);
    localStorage.setItem('datos_cobro',JSON.stringify(
      {
        cantidad:      1,
        monto:         Number(this.myFormHReintegro.get('monto')?.value)
      })
    )

    this.router.navigate(['/pagos/tabla-conceptos',this.idConcepto,this.tipoForm]);
    return
  }
}


/**
 Servicio para obtener el valor de la UMA
• SH - COPIAS CERTIFICADAS DE RECIBOS DE PAGO URGENTE - No respeta el que si le envia onto 1 mande el valor real
CUALQUIER OTRA CERTIFICACIÓN DISTINTA A RECIBO DE PAGO: B) POR LA PRIMERA HOJA URGENTE


'no_hojas',
public displayedColumns = ['descripcion','ejercicioFiscal','importe','cantidad','subtotal'];
public conceptos: Concepto[] = [];


public tipoFormEdit: boolean = false;
public tipoFormEdit_hoja: boolean = false;

private asJson!:IsanCobros;

104 31.2

environments.valor_uma + ((totalHojas-1) * (monto*0.15))
104 + (49 * 15.6) = 104 + 765.4 = 119.6

lineaDetalle:"0644¬1¬
COPIA CERTIFICADA DE EXPEDIENTES: B) POR LA PRIMER HOJA Y LAS SIGUIENTES HOJAS HASTA CINCUENTA¬120¬2023¬¬4021¬|"

form 16, 14, 17
hacienda-reintegros ° /pagos/hacienda-reintegros 1429 16

XAXX010101000

tabla-conceptos

"FAVOR DE LLENAR EL SIGUIENTE FORMULARIO PARA CUALQUIER DUDA O ACLARACION, YA QUE SI SU PAGO NO CUENTA CON LOS DATOS
CORRECTOS, NO SERA APLICADO CONTABLEMENTE "
Nombre
Telefono
Correo
** Corresponde a un reintegro por apoyo emergente a transportistas
*** Fecha en que se realizó la retención
*** Ejercicio fiscal del fondo o programa
*** Nombre del fondo o programa
*** Número de contrato
***Objeto del contrato
*** Fuente de financiamiento
*** Monto ejercido
*** Monto retenido
*** Número de oficio de autorización
*** Número de factura emitida por el proveedor
Favor de Ingresar el Monto a Pagar


ISAN
	valida email, valida rfc, valida razon social, valida CP, valida telefono
 */
