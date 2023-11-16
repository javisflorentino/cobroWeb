import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImpuestosComponent } from '../../components/impuestos/impuestos.component';
import { Router, ActivatedRoute } from '@angular/router';
import { TopLevel } from 'src/app/shared/interfaces/calculo-conceptos';

@Component({
  selector: 'hacienda-impuestos-pages',
  templateUrl: './impuestos-pages.component.html',
  styleUrls: ['./impuestos-pages.component.css']
})
export class ImpuestosPagesComponent implements OnInit, AfterViewInit, OnDestroy {
  //Controla la visualización del Spinner
  public isLoading: boolean = false;
  /* Se usa para obtener el nombre del concepto seleccionado y mostrarlo en el HTML */
  public conceptTitle: string = '';
  /* Bloque el boton de Calcular para evitar acciones duplicadas  */
  public buttBlock = false;
  //Se obtiene una referencia a todo el componente que se renderizó en este componente. Se uso el nombre del componente
  private idConcepto: number = 0;
  private tipoForm: number = 0;

  @ViewChild(ImpuestosComponent)
  private childComponent!: ImpuestosComponent;


  public myForm: FormGroup = this.fb.group({});

  constructor( private fb: FormBuilder, private router: Router, private activateRaute: ActivatedRoute ) {}

  ngOnDestroy(): void {
    this.activateRaute.params.subscribe().unsubscribe();
  }

  ngAfterViewInit(): void {
    setTimeout( () => {
      this.myForm.addControl('impuestos',this.childComponent.myFormImpuestos);
      this.childComponent.myFormImpuestos.setParent(this.myForm);
    });
  }

  ngOnInit(): void {
    this.conceptTitle = localStorage.getItem('concept')!;

    this.activateRaute.params.subscribe(({idConcepto,tipoForm}) => {
      this.idConcepto = idConcepto;
      this.tipoForm = tipoForm;
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.buttBlock = true;
    if ( this.myForm.invalid ) {
      this.myForm.markAllAsTouched();
      this.isLoading = false;
      this.buttBlock = false;
      return;
    }
    if(this.myForm.get('impuestos')?.get('actualizacion')?.value > 0) {
      let contribuyente: TopLevel = {} as TopLevel;
      contribuyente.data.conceptos.push({
            id: 0,
            clave:'',
            cantidad:1,
            descripcion:'',
            ejercicioFiscal: 0,
            importe:         0,
            padre:          0,
          });

          /*
          var resultadoTMP = {claveConcepto: null, descripcion: null, ejercicioFiscal: null, importe: null, adicional15: null, adicional5i: null, adicional5u: null, adicional25: null, recargos: null, multas: null, descRecargos: null, descMultas: null, total: null, lineaDetalle: null, actualizacion: null, idConcepto: null};
            if (conceptoCobrar.idConcepto === '651') { // 114 y 651 son sobre rifas, se trabajara con 651 por motivo de la descripción
                resultadoTMP.claveConcepto = "0637";
                resultadoTMP.descripcion = "ACTUALIZACIÓN IMPUESTO SOBRE LOTERIAS, RIFAS Y SORTEOS";
            } else {
                resultadoTMP.claveConcepto = "0637";
                resultadoTMP.descripcion = "ACTUALIZACION" + " " + conceptoCobrar.descripcion;
            }
          */

    }
    if(this.myForm.get('impuestos')?.get('recargo'))

    localStorage.setItem('route_origen',`hacienda/hacienda-impuestos/${this.idConcepto}/${this.tipoForm}`);

    this.router.navigate(['/pagos/tabla-conceptos',this.idConcepto,this.tipoForm]);
          return
  }
}
